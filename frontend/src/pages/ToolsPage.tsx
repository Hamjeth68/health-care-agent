import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { ActivitySquare, AlertCircle, Loader2, Pill, ShieldCheck } from 'lucide-react';
import { checkDrugInteraction, predictRisk } from '../services/api';

export default function ToolsPage() {
  const [drug1, setDrug1] = useState('aspirin');
  const [drug2, setDrug2] = useState('ibuprofen');
  const [age, setAge] = useState('45');
  const [bp, setBp] = useState('140');
  const [interaction, setInteraction] = useState('');
  const [prediction, setPrediction] = useState('');
  const [error, setError] = useState('');
  const [loadingTool, setLoadingTool] = useState<'interaction' | 'risk' | ''>('');

  const runInteraction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoadingTool('interaction');
    try {
      const result = await checkDrugInteraction(drug1.trim(), drug2.trim());
      setInteraction(result.interaction);
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to check interaction.');
    } finally {
      setLoadingTool('');
    }
  };

  const runPrediction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoadingTool('risk');
    try {
      const result = await predictRisk(Number(age), Number(bp));
      setPrediction(result.prediction);
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to predict risk.');
    } finally {
      setLoadingTool('');
    }
  };

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto relative z-10 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-foreground">Clinical Tools</h1>
          <p className="text-sm text-muted-foreground mt-1">Run focused backend tools for medication and risk context.</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                <Pill className="text-primary" size={22} />
              </div>
              <div>
                <h2 className="text-foreground font-bold">Drug Interaction</h2>
                <p className="text-xs text-muted-foreground">Compare two medications.</p>
              </div>
            </div>

            <form onSubmit={runInteraction} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">First drug</span>
                <input value={drug1} onChange={(e) => setDrug1(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:border-primary" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Second drug</span>
                <input value={drug2} onChange={(e) => setDrug2(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:border-primary" />
              </label>
              <button disabled={loadingTool === 'interaction'} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {loadingTool === 'interaction' ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Check interaction
              </button>
            </form>

            {interaction && (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-foreground whitespace-pre-wrap">
                {interaction}
              </div>
            )}
          </section>

          <section className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                <ActivitySquare className="text-primary" size={22} />
              </div>
              <div>
                <h2 className="text-foreground font-bold">Health Risk Predictor</h2>
                <p className="text-xs text-muted-foreground">Estimate risk from age and blood pressure.</p>
              </div>
            </div>

            <form onSubmit={runPrediction} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Age</span>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:border-primary" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Systolic BP</span>
                <input type="number" value={bp} onChange={(e) => setBp(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:border-primary" />
              </label>
              <button disabled={loadingTool === 'risk'} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {loadingTool === 'risk' ? <Loader2 size={16} className="animate-spin" /> : <ActivitySquare size={16} />}
                Predict risk
              </button>
            </form>

            {prediction && (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-foreground whitespace-pre-wrap">
                {prediction}
              </div>
            )}
          </section>
        </div>
      </div>
    </motion.main>
  );
}
