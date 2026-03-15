import { useSharedState } from '@/lib/shared-storage';
import { TEAM_ACCOUNTS } from '@/config/team';
import { Clock, CheckCircle2, X } from 'lucide-react';

interface ActivityFeedProps {
    onClose?: () => void;
}

const ActivityFeed = ({ onClose }: ActivityFeedProps) => {
    const { state } = useSharedState();
    const logs = state.activityFeed || [];

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
                <h3 className="text-[13px] font-bold flex items-center gap-2 text-[#1B2533]">
                    <Clock className="w-4 h-4 text-[#106292]" />
                    Live Activity
                </h3>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-[#F1F5F9] text-[#64748B] transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
                {logs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xs text-[#94A3B8]">No recent actions recorded</p>
                    </div>
                ) : (
                    logs.map((log) => {
                        const account = TEAM_ACCOUNTS[log.role as any] || { color: '#888' };
                        const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                            <div key={log.id} className="flex gap-3 group animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="flex-shrink-0">
                                    <div 
                                        className="w-2 h-2 rounded-full mt-1.5"
                                        style={{ backgroundColor: account.color }}
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-[12px] text-[#1B2533] leading-normal font-medium">
                                        <span style={{ color: account.color }}>{log.userName}</span>
                                        {' '}
                                        <span className="text-[#64748B] font-normal">{log.action}</span>
                                    </p>
                                    <span className="text-[10px] text-[#94A3B8] font-medium">{time}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                <div className="flex items-center gap-2 text-[10px] text-[#64748B] uppercase tracking-[0.15em] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                    Local Storage Secured
                </div>
            </div>
        </div>
    );
};

export default ActivityFeed;
