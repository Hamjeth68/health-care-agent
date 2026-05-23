export type MonitoringStatus = "stable" | "watch" | "urgent";

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
}

export interface ChatMessage {
  id: string;
  user: string;
  bot: string;
  role: string;
  createdAt: string;
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
  status: MonitoringStatus;
  risk_score: number;
  alerts: string[];
  recommendations: string[];
  disclaimer: string;
}
