import { CheckInStatus } from '@/types/hackathon';

interface StatusBadgeProps {
  status: CheckInStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles: Record<CheckInStatus, string> = {
    'Checked-In': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Checked-Out': 'bg-rose-50 text-rose-700 border-rose-100',
    'Not Checked-In': 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'Checked-In' ? 'bg-emerald-500' :
        status === 'Checked-Out' ? 'bg-rose-500' : 'bg-slate-400'
      }`} />
      {status}
    </span>
  );
};

export default StatusBadge;
