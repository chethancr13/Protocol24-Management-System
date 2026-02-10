import { CheckInStatus } from '@/types/hackathon';

interface StatusBadgeProps {
  status: CheckInStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles: Record<CheckInStatus, string> = {
    'Checked-In': 'bg-success/15 text-success border-success/20',
    'Checked-Out': 'bg-destructive/15 text-destructive border-destructive/20',
    'Not Checked-In': 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'Checked-In' ? 'bg-success animate-glow-pulse' :
        status === 'Checked-Out' ? 'bg-destructive' : 'bg-muted-foreground'
      }`} />
      {status}
    </span>
  );
};

export default StatusBadge;
