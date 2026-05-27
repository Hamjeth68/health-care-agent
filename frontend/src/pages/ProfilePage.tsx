import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.name ?? user?.fullName ?? '');
    setPhone(profile?.phone ?? user?.phone ?? '');
  }, [profile, user?.fullName, user?.phone]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) return;

    setStatus('');
    setError('');
    setSaving(true);
    try {
      await updateProfile(user.id, name.trim(), phone.trim());
      await refreshProfile(user.id);
      setStatus('Profile updated.');
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto relative z-10 p-4 md:p-6">
      <div className="max-w-3xl mx-auto glass-strong rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <UserRound className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:border-primary" />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Phone Number</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:border-primary" />
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {status && (
            <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
              <CheckCircle2 size={14} />
              {status}
            </div>
          )}

          <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save profile
          </button>
        </form>
      </div>
    </motion.main>
  );
}
