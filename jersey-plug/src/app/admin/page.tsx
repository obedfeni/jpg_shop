'use client';
import { useEffect, useState } from 'react';
import { LoginForm } from '@/components/admin/LoginForm';
import { Dashboard } from '@/components/admin/Dashboard';
import { useAuth } from '@/hooks/index';
import { COLORS } from '@/lib/constants';

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setShowLogin(true);
    if (isAuthenticated) setShowLogin(false);
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-jp-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: COLORS.textMuted }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (showLogin || !isAuthenticated) {
    return (
      <LoginForm
        onCancel={() => window.location.href = '/'}
        onSuccess={() => setShowLogin(false)}
      />
    );
  }

  return <Dashboard />;
}
