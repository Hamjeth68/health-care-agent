import { API_URL } from "../config";
import { supabase } from "./supabase";
import type { MonitoringPayload, MonitoringSummary, Profile } from "../types";

type RequestOptions = Omit<RequestInit, "headers"> & {
  auth?: boolean;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

async function getAuthHeaders(enabled: boolean): Promise<Record<string, string>> {
  if (!enabled) {
    return {};
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 20000);
  const { auth = true, timeoutMs: _timeoutMs, headers, ...fetchOptions } = options;

  try {
    const authHeaders = await getAuthHeaders(auth);
    const response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...headers
      }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.error) {
      throw new Error(data?.error || `Server returned ${response.status}`);
    }
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function askHealthcareAgent(query: string, role: string, userId?: string) {
  return request<{ response: string; role: string }>("/ask", {
    method: "POST",
    timeoutMs: 45000,
    body: JSON.stringify({ query, role, user_id: userId })
  });
}

export function getProfile(userId: string) {
  return request<Profile>(`/profile?user_id=${encodeURIComponent(userId)}`);
}

export function updateProfile(userId: string, name?: string, phone?: string) {
  return request<{ status: string; data?: Profile[] }>("/profile", {
    method: "PUT",
    body: JSON.stringify({ user_id: userId, name, phone })
  });
}

export function syncAuthenticatedProfile(name?: string, phone?: string) {
  return request<{ status: string; profile: Profile | null }>("/auth/profile", {
    method: "POST",
    body: JSON.stringify({ name, phone })
  });
}

export function getMonitoringSummary(payload: MonitoringPayload) {
  return request<MonitoringSummary>("/monitoring/summary", {
    auth: false,
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function checkDrugInteraction(drug1: string, drug2: string) {
  return request<{ interaction: string }>("/interaction", {
    auth: false,
    method: "POST",
    body: JSON.stringify({ drug1, drug2 })
  });
}

export function predictRisk(age: number, bp: number) {
  return request<{ prediction: string }>("/predict", {
    auth: false,
    method: "POST",
    body: JSON.stringify({ age, bp })
  });
}
