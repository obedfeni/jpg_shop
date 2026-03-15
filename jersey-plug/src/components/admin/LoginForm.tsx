'use client';
import { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input } from '@/components/ui/index';
import { COLORS, BUSINESS } from '@/lib/constants';
import { useAuth } from '@/hooks/index';
import { useRouter } from 'next/navigation';

interface LoginFormProps { onCancel: () => void; onSuccess: () => void; }

export function LoginForm({ onCancel, onSuccess }: LoginFormProps) {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(creds.username, creds.password);
    if (ok) { onSuccess(); router.refresh(); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: COLORS.bg }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border-2" style={{ borderColor: COLORS.border }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }}>
            ⚽
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>{BUSINESS.name}</h1>
          <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>Admin Panel — Secure Access</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Username" value={creds.username}
            onChange={(e) => setCreds((p) => ({ ...p, username: e.target.value }))}
            required autoComplete="username" icon={<User className="w-4 h-4" />} placeholder="admin" />
          <div className="relative">
            <Input label="Password" type={showPwd ? 'text' : 'password'} value={creds.password}
              onChange={(e) => setCreds((p) => ({ ...p, password: e.target.value }))}
              required autoComplete="current-password" icon={<Lock className="w-4 h-4" />} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 bottom-2.5 text-jp-text-muted hover:text-jp-text">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">Sign In</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
