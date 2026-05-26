import supabase from '../supabase';

const defaultApiUrl =
  window.location.hostname === 'hamjeth68.github.io'
    ? 'https://g4oilbf1u0.execute-api.us-east-1.amazonaws.com'
    : 'http://127.0.0.1:8000';

export const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl;

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
}

export interface ChatHistoryItem {
  id?: string;
  query: string;
  response: string;
  role?: string | null;
  created_at: string | null;
}

export interface MonitoringPayload {
  age?: number;
  systolic_bp: number;
  diastolic_bp?: number;
  heart_rate?: number;
  temperature_c?: number;
  glucose_mg_dl?: number;
  oxygen_saturation?: number;
}

export interface MonitoringSummary {
  status: 'stable' | 'watch' | 'urgent';
  risk_score: number;
  alerts: string[];
  recommendations: string[];
  disclaimer: string;
}

type RequestOptions = Omit<RequestInit, 'headers'> & {
  auth?: boolean;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

async function getAuthHeaders(enabled: boolean): Promise<Record<string, string>> {
  if (!enabled) return {};

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 20000);
  const { auth = true, headers, ...fetchOptions } = options;

  try {
    const authHeaders = await getAuthHeaders(auth);
    const response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.error) {
      throw new Error(data?.detail || data?.error || `Server returned ${response.status}`);
    }

    return data as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function askHealthcareAgent(query: string, role: string, userId?: string) {
  return request<{ response: string; role: string }>('/ask', {
    method: 'POST',
    timeoutMs: 45000,
    body: JSON.stringify({ query, role, user_id: userId }),
  });
}

export function getChatHistory(userId: string) {
  return request<{ data: ChatHistoryItem[] }>(`/history?user_id=${encodeURIComponent(userId)}`);
}

export function clearChatHistory(userId: string) {
  return request<{ status: string }>(`/clear?user_id=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}

export function getProfile(userId: string) {
  return request<Profile>(`/profile?user_id=${encodeURIComponent(userId)}`);
}

export function updateProfile(userId: string, name?: string, phone?: string) {
  return request<{ status: string; data?: Profile[] }>('/profile', {
    method: 'PUT',
    body: JSON.stringify({ user_id: userId, name, phone }),
  });
}

export function syncAuthenticatedProfile(name?: string, phone?: string) {
  return request<{ status: string; profile: Profile | null }>('/auth/profile', {
    method: 'POST',
    body: JSON.stringify({ name, phone }),
  });
}

export function getMonitoringSummary(payload: MonitoringPayload) {
  return request<MonitoringSummary>('/monitoring/summary', {
    auth: false,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function checkDrugInteraction(drug1: string, drug2: string) {
  return request<{ interaction: string }>('/interaction', {
    auth: false,
    method: 'POST',
    body: JSON.stringify({ drug1, drug2 }),
  });
}

export function predictRisk(age: number, bp: number) {
  return request<{ prediction: string }>('/predict', {
    auth: false,
    method: 'POST',
    body: JSON.stringify({ age, bp }),
  });
}
