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
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Live Activity
                </h3>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {logs.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-xs text-muted-foreground">No recent actions</p>
                    </div>
                ) : (
                    logs.map((log) => {
                        const account = TEAM_ACCOUNTS[log.role as any] || { color: '#888' };
                        const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                            <div key={log.id} className="flex gap-3 group animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="flex-shrink-0 mt-1">
                                    <div 
                                        className="w-2 h-2 rounded-full mt-1.5 ring-4 ring-background"
                                        style={{ backgroundColor: account.color }}
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-xs text-foreground leading-relaxed">
                                        <span className="font-bold" style={{ color: account.color }}>{log.userName}</span>
                                        {' '}
                                        <span className="text-muted-foreground">{log.action}</span>
                                    </p>
                                    <span className="text-[10px] text-muted-foreground font-mono">{time}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <div className="p-4 bg-muted/30 border-t border-border">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    Synced with Network
                </div>
            </div>
        </div>
    );
};

export default ActivityFeed;
