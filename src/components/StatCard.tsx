import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'primary' | 'accent' | 'success' | 'destructive' | 'warning';
  subtitle?: ReactNode;
}

const accentStyles = {
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/15 text-accent',
  success: 'bg-success/15 text-success',
  destructive: 'bg-destructive/15 text-destructive',
  warning: 'bg-warning/15 text-warning',
};

const StatCard = ({ title, value, icon: Icon, accent = 'primary', subtitle }: StatCardProps) => {
  return (
    <div className="glass-card-hover rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentStyles[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
