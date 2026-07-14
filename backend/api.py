from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
import os
import threading
import asyncio
import jwt
from jwt import PyJWKClient
from supabase import create_client, Client
from utils.download import download_file
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Supabase project reference — used to build the public JWKS URL for token
# verification without requiring a service role key on the server.
_SUPABASE_PROJECT = "njgzkxvftoccdckcivaj"
SUPABASE_URL = os.getenv("SUPABASE_URL", f"https://{_SUPABASE_PROJECT}.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

supabase: Client | None = None
if SUPABASE_KEY:
	supabase = create_client(SUPABASE_URL.rstrip("/").removesuffix("/rest/v1"), SUPABASE_KEY)

# Supabase Auth exposes a public JWKS so tokens can be verified without the
# service role key — chat works even before EC2 is fully configured.
_jwks_client: PyJWKClient | None = None
_jwks_lock = threading.Lock()

def _get_jwks_client() -> PyJWKClient:
	global _jwks_client
	with _jwks_lock:
		if _jwks_client is None:
			base = SUPABASE_URL.rstrip("/").removesuffix("/rest/v1")
			_jwks_client = PyJWKClient(f"{base}/auth/v1/.well-known/jwks.json")
	return _jwks_client

FAISS_PATH = os.path.join(BASE_DIR, "medical_vector_db.faiss")
DATA_PATH = os.path.join(BASE_DIR, "medical_rag_dataset.json")

FAISS_URL = "https://drive.google.com/uc?id=1B4TMBckUt_fgnaV9GrjmAlDrvUikB2Hg"
DATA_URL = "https://drive.google.com/uc?id=1JrCN_UG_4bJht6NbzQe3_a3ytqi3dXAG"

medical_agent = None
check_drug_interaction = None
predict_health_risk = None


def load_medical_agent():
	global medical_agent
	if medical_agent is None:
		try:
			from agent.medical_agent import medical_agent as ma
			medical_agent = ma
		except ImportError as exc:
			raise HTTPException(
				status_code=503,
				detail=(
					"AI assistant is unavailable on this instance — "
					"sentence-transformers / torch are not installed. "
					f"({exc})"
				),
			)
	return medical_agent


def load_drug_tool():
	global check_drug_interaction
	if check_drug_interaction is None:
		from tools.drug_interaction_tool import check_drug_interaction as cdi
		check_drug_interaction = cdi
	return check_drug_interaction


def load_predictor():
	global predict_health_risk
	if predict_health_risk is None:
		from tools.health_predictor import predict_health_risk as phr
		predict_health_risk = phr
	return predict_health_risk

app = FastAPI(title="AI-Powered Healthcare Monitoring Agent API", version="2.0.0")

@app.on_event("startup")
def startup_event():
	print("Application starting up...")
	
	# 1. Download resources if missing (works locally & on Render)
	download_file(FAISS_URL, FAISS_PATH)
	download_file(DATA_URL, DATA_PATH)
	
	# 2. Heavy model warmup is optional. On small EC2 instances, eager warmup can
	# consume enough memory to prevent the API process from staying online.
	if os.getenv("ENABLE_MODEL_WARMUP", "").strip().lower() in {"1", "true", "yes"}:
		from retrieval.hybrid_retriever import warmup_models
		threading.Thread(target=warmup_models, daemon=True).start()

def _get_allowed_origins() -> list[str]:
	configured = os.getenv("CORS_ALLOW_ORIGINS", "")
	if configured.strip():
		return [o.strip() for o in configured.split(",") if o.strip()]

	return [
		"http://localhost:5173",
		"http://127.0.0.1:5173",
		"https://hamjeth68.github.io",
		"https://team-agent-wars-healthcare-monitori.vercel.app",
		"http://localhost:8080",
	]


# --------------- CORS ---------------
app.add_middleware(
	CORSMiddleware,
	allow_origins=_get_allowed_origins(),
	allow_origin_regex=r"https://.*\.vercel\.app",
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# --------------- In-memory chat log ---------------
chat_history: list[dict] = []


# --------------- Models ---------------
class QueryRequest(BaseModel):
	query: str
	role: str = "user"
	user_id: str | None = None


class PredictRequest(BaseModel):
	age: int
	bp: int


class ProfileUpdateRequest(BaseModel):
	user_id: str
	name: str | None = None
	phone: str | None = None


class ProfileSyncRequest(BaseModel):
	name: str | None = None
	phone: str | None = None


class InteractionRequest(BaseModel):
	drug1: str
	drug2: str


class VitalsRequest(BaseModel):
	age: int | None = None
	systolic_bp: int
	diastolic_bp: int | None = None
	heart_rate: int | None = None
	temperature_c: float | None = None
	glucose_mg_dl: int | None = None
	oxygen_saturation: int | None = None


def _require_supabase() -> Client:
	if not supabase:
		raise HTTPException(
			status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
			detail="Supabase is not configured on the backend.",
		)
	return supabase


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
	if not authorization:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header.")
	scheme, _, token = authorization.partition(" ")
	if scheme.lower() != "bearer" or not token:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header must use Bearer token.")

	# Primary path: verify via Supabase's public JWKS (no service role key needed).
	try:
		jwks = _get_jwks_client()
		signing_key = jwks.get_signing_key_from_jwt(token)
		claims = jwt.decode(
			token,
			signing_key.key,
			algorithms=["RS256"],
			options={"require": ["exp", "iat", "sub"], "verify_aud": False},
			leeway=60,
		)
		user_id = claims.get("sub")
		if not user_id:
			raise ValueError("No sub claim")
		meta = claims.get("user_metadata") or {}
		return {
			"id": user_id,
			"email": claims.get("email"),
			"metadata": {
				"name": meta.get("full_name") or meta.get("name"),
				"phone": meta.get("phone"),
			},
		}
	except Exception:
		pass

	# Fallback: use the admin client if the service role key is configured.
	if supabase:
		try:
			response = supabase.auth.get_user(token)
			u = response.user
			if u:
				um = u.user_metadata or {}
				return {
					"id": u.id,
					"email": u.email,
					"metadata": {
						"name": um.get("full_name") or um.get("name"),
						"phone": um.get("phone"),
					},
				}
		except Exception:
			pass

	raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session.")


def _assert_same_user(requested_user_id: str, current_user: dict) -> None:
	if requested_user_id != current_user["id"]:
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="You can only access your own account.",
		)


def _profile_payload(user_id: str, name: str | None = None, phone: str | None = None) -> dict:
	payload = {"id": user_id}
	if name is not None:
		payload["name"] = name
	if phone is not None:
		payload["phone"] = phone
	return payload


# --------------- Endpoints ---------------
@app.get("/health")
def health_check():
	return {"status": "ok"}


@app.post("/monitoring/summary")
def monitoring_summary(req: VitalsRequest):
	alerts: list[str] = []
	recommendations: list[str] = []
	score = 0

	if req.systolic_bp >= 180 or (req.diastolic_bp is not None and req.diastolic_bp >= 120):
		alerts.append("Blood pressure is in a hypertensive crisis range.")
		recommendations.append("Seek urgent medical support, especially with chest pain, breathlessness, weakness, or severe headache.")
		score += 4
	elif req.systolic_bp >= 140 or (req.diastolic_bp is not None and req.diastolic_bp >= 90):
		alerts.append("Blood pressure is elevated.")
		recommendations.append("Rest, recheck blood pressure, reduce salt/caffeine today, and consult a clinician if it stays high.")
		score += 2

	if req.heart_rate is not None:
		if req.heart_rate > 120:
			alerts.append("Heart rate is high.")
			recommendations.append("Avoid exertion and monitor for dizziness, chest pain, or shortness of breath.")
			score += 2
		elif req.heart_rate < 50:
			alerts.append("Heart rate is low.")
			recommendations.append("Check for fatigue, faintness, or medication effects and discuss with a clinician.")
			score += 2

	if req.temperature_c is not None and req.temperature_c >= 38:
		alerts.append("Temperature suggests fever.")
		recommendations.append("Hydrate, rest, and track symptoms; seek help if fever persists or worsens.")
		score += 1

	if req.glucose_mg_dl is not None:
		if req.glucose_mg_dl >= 250:
			alerts.append("Glucose is very high.")
			recommendations.append("Follow your diabetes care plan and contact a clinician if readings remain high.")
			score += 3
		elif req.glucose_mg_dl < 70:
			alerts.append("Glucose is low.")
			recommendations.append("Use a fast-acting carbohydrate if appropriate and recheck soon.")
			score += 3

	if req.oxygen_saturation is not None and req.oxygen_saturation < 92:
		alerts.append("Oxygen saturation is low.")
		recommendations.append("Seek urgent medical advice, especially with breathing difficulty.")
		score += 4

	if not alerts:
		alerts.append("Vitals are within the monitored comfort range.")
		recommendations.append("Keep tracking trends and maintain regular sleep, hydration, nutrition, and medication routines.")

	status = "stable"
	if score >= 5:
		status = "urgent"
	elif score >= 2:
		status = "watch"

	return {
		"status": status,
		"risk_score": min(score, 10),
		"alerts": alerts,
		"recommendations": recommendations,
		"disclaimer": "This monitoring summary is informational and does not replace professional medical advice."
	}


@app.post("/ask")
async def ask(req: QueryRequest, current_user: dict = Depends(get_current_user)):
	if req.user_id:
		_assert_same_user(req.user_id, current_user)
	user_id = current_user["id"]

	def run_pipeline():
		agent = load_medical_agent()
		memory = [{"user": m["user"], "assistant": m["bot"]} for m in chat_history[-12:]]
		response = agent(req.query, conversation_memory=memory)

		chat_history.append({
			"user": req.query,
			"bot": response,
			"role": req.role,
			"created_at": datetime.now(timezone.utc).isoformat(),
		})

		if supabase:
			try:
				supabase.table("chat_history").insert({
					"user_id": user_id,
					"query": req.query,
					"response": response,
					"role": req.role,
				}).execute()
				print("Chat saved to Supabase")
			except Exception as e:
				print("Supabase insert failed:", e)

		return response

	try:
		result = await asyncio.to_thread(run_pipeline)
		return {"response": result, "role": req.role}
	except Exception as e:
		return {"error": str(e)}


@app.get("/history")
async def get_history(user_id: str, current_user: dict = Depends(get_current_user)):
	_assert_same_user(user_id, current_user)
	client = _require_supabase()
	try:
		res = client.table("chat_history") \
			.select("*") \
			.eq("user_id", user_id) \
			.order("created_at", desc=False) \
			.execute()
		return {"data": res.data}
	except Exception as e:
		return {"error": str(e)}


@app.delete("/clear")
async def clear_history(user_id: str, current_user: dict = Depends(get_current_user)):
	_assert_same_user(user_id, current_user)
	client = _require_supabase()
	try:
		client.table("chat_history") \
			.delete() \
			.eq("user_id", user_id) \
			.execute()
		return {"status": "cleared"}
	except Exception as e:
		return {"error": str(e)}


@app.get("/profile")
async def get_profile(user_id: str, current_user: dict = Depends(get_current_user)):
	_assert_same_user(user_id, current_user)
	client = _require_supabase()
	try:
		res = client.table("profiles") \
			.select("*") \
			.eq("id", user_id) \
			.single() \
			.execute()
		return res.data
	except Exception as e:
		return {"error": str(e)}


@app.put("/profile")
async def update_profile(req: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
	_assert_same_user(req.user_id, current_user)
	client = _require_supabase()
	try:
		payload = _profile_payload(req.user_id, req.name, req.phone)
		if len(payload) == 1:
			return {"status": "no data to update"}

		res = client.table("profiles") \
			.upsert(payload) \
			.execute()
		return {"status": "updated", "data": res.data}
	except Exception as e:
		return {"error": str(e)}


@app.post("/auth/profile")
async def sync_profile(req: ProfileSyncRequest, current_user: dict = Depends(get_current_user)):
	client = _require_supabase()
	meta = current_user.get("metadata") or {}
	name = req.name if req.name is not None else meta.get("name")
	phone = req.phone if req.phone is not None else meta.get("phone")

	try:
		res = client.table("profiles") \
			.upsert(_profile_payload(current_user["id"], name, phone)) \
			.execute()
		return {"status": "synced", "profile": res.data[0] if res.data else None}
	except Exception as e:
		return {"error": str(e)}


@app.post("/predict")
def predict(req: PredictRequest):
	predictor = load_predictor()
	result = predictor(req.age, req.bp)
	return {"prediction": result}


@app.post("/interaction")
def interaction(req: InteractionRequest):
	tool = load_drug_tool()
	result = tool(req.drug1, req.drug2)
	return {"interaction": result}

@app.get("/")
def health():
    return {"status": "ok"}
