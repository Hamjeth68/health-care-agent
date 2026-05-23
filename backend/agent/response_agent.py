from agent.document_sections import collect_section_docs
from agent.health_insights import generate_insights


def _grounded_line(doc):
	text = " ".join(doc.get("text", "").split())
	name = doc.get("name", "Unknown")
	section = doc.get("section", "overview")
	return f"- {text} ({name} - {section})"


def structured_response(docs):

	section_docs = collect_section_docs(docs)

	response = "🩺 Medical Answer:\n\n"

	if section_docs["symptoms"]:
		response += "Symptoms:\n"
		for doc in section_docs["symptoms"]:
			response += _grounded_line(doc) + "\n"

	if section_docs["treatment"]:
		response += "\nTreatment:\n"
		for doc in section_docs["treatment"]:
			response += _grounded_line(doc) + "\n"

	if section_docs["others"]:
		response += "\nAdditional Info:\n"
		for doc in section_docs["others"]:
			response += _grounded_line(doc) + "\n"

	return response.strip()


def response_agent(docs):

	insights = generate_insights(docs)

	return structured_response(docs) + "\n\n🔍 Insights:\n" + insights
