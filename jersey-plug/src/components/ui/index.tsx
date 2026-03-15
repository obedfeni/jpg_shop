import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

// ── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ children, variant = 'primary', size = 'md', isLoading, className, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    primary: 'bg-gradient-to-br from-jp-primary to-jp-primary-dark text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:ring-jp-primary',
    secondary: 'bg-white border border-jp-border text-jp-text hover:bg-jp-primary-light focus:ring-jp-primary',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost: 'text-jp-text hover:bg-jp-primary-light focus:ring-gray-300',
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}

// ── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-jp-text mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-jp-text-muted">{icon}</span>}
        <input className={cn(
          'w-full rounded-xl border border-jp-border bg-white px-4 py-2.5 text-sm text-jp-text placeholder:text-jp-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-jp-primary/30 focus:border-jp-primary transition-all',
          error && 'border-red-400 focus:ring-red-200',
          icon && 'pl-10', className
        )} {...props} />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-white rounded-2xl border border-jp-border shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';
const badgeStyles: Record<BadgeVariant, string> = {
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-orange-100 text-orange-800',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-800',
};

export function Badge({ children, variant = 'primary', className }: { children: React.ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', badgeStyles[variant], className)}>
      {children}
    </span>
  );
}
