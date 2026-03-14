import { useSharedState } from '@/lib/shared-storage';
import { AlertTriangle } from 'lucide-react';

const BUDGET_LIMIT = 5000;

const GlobalAlerts = () => {
    const { state } = useSharedState();
    const totalExpenses = state.expenses?.filter(e => e.status !== 'Cancelled').reduce((sum, e) => sum + e.amount, 0) || 0;

    if (totalExpenses < BUDGET_LIMIT * 0.9) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
            <div className="bg-destructive text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 animate-fade-up pointer-events-auto border border-destructive/20">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm">Budget Warning</h4>
                    <p className="text-xs opacity-90">Total expenses (${totalExpenses}) have reached {((totalExpenses/BUDGET_LIMIT)*100).toFixed(0)}% of limit</p>
                </div>
            </div>
        </div>
    );
};

export default GlobalAlerts;
