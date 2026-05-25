import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, HeartPulse, Loader2, Thermometer } from 'lucide-react';
import { getMonitoringSummary, MonitoringSummary } from '../services/api';

const initialVitals = {
  age: '35',
  systolic_bp: '128',
  diastolic_bp: '82',
  heart_rate: '78',
  temperature_c: '37',
  glucose_mg_dl: '110',
  oxygen_saturation: '98',
};

function toNumber(value: string) {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : Number(trimmed);
}

export default function MonitorPage() {
  const [vitals, setVitals] = useState(initialVitals);
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const systolic = Number(vitals.systolic_bp);
    if (!Number.isFinite(systolic) || systolic <= 0) {
      setError('Systolic blood pressure is required.');
      return;
    }

    setLoading(true);
    try {
      const result = await getMonitoringSummary({
        age: toNumber(vitals.age),
        systolic_bp: systolic,
        diastolic_bp: toNumber(vitals.diastolic_bp),
        heart_rate: toNumber(vitals.heart_rate),
        temperature_c: toNumber(vitals.temperature_c),
        glucose_mg_dl: toNumber(vitals.glucose_mg_dl),
        oxygen_saturation: toNumber(vitals.oxygen_saturation),
      });
      setSummary(result);
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to generate monitoring summary.');
    } finally {
      setLoading(false);
    }
  };

  const statusTone = summary?.status === 'urgent'
    ? 'border-danger/30 bg-danger/10 text-danger'
    : summary?.status === 'watch'
      ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
      : 'border-primary/30 bg-primary/10 text-primary';

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto relative z-10 p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5">
        <section className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
              <HeartPulse className="text-primary" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Vitals Monitor</h1>
              <p className="text-xs text-muted-foreground">Generate a risk-aware health summary.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['age', 'Age'],
              ['systolic_bp', 'Systolic BP'],
              ['diastolic_bp', 'Diastolic BP'],
              ['heart_rate', 'Heart Rate'],
              ['temperature_c', 'Temperature C'],
              ['glucose_mg_dl', 'Glucose mg/dL'],
              ['oxygen_saturation', 'Oxygen %'],
            ].map(([key, label]) => (
              <label key={key} className={key === 'oxygen_saturation' ? 'sm:col-span-2' : ''}>
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <input
                  type="number"
                  step={key === 'temperature_c' ? '0.1' : '1'}
                  value={vitals[key as keyof typeof vitals]}
                  onChange={(event) => setVitals((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                />
              </label>
            ))}

            {error && (
              <div className="sm:col-span-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
              Analyze vitals
            </button>
          </form>
        </section>

        <section className="glass-strong rounded-2xl p-6">
          {summary ? (
            <div className="space-y-5">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase ${statusTone}`}>
                {summary.status === 'stable' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                {summary.status} | Risk {summary.risk_score}/10
              </div>

              <div>
                <h2 className="text-foreground text-lg font-bold mb-3">Alerts</h2>
                <div className="space-y-2">
                  {summary.alerts.map((item) => (
                    <div key={item} className="rounded-xl border border-border bg-muted/20 p-3 text-sm text-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-foreground text-lg font-bold mb-3">Recommendations</h2>
                <div className="space-y-2">
                  {summary.recommendations.map((item) => (
                    <div key={item} className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">{summary.disclaimer}</p>
            </div>
          ) : (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center">
              <Thermometer size={34} className="text-primary mb-4" />
              <h2 className="text-foreground text-lg font-bold">Ready for vitals</h2>
              <p className="text-sm text-muted-foreground max-w-sm mt-2">
                Enter readings to classify the status and receive practical follow-up guidance.
              </p>
            </div>
          )}
        </section>
      </div>
    </motion.main>
  );
}
