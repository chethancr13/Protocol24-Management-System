import { useMemo } from 'react';
import { useSharedState } from '@/lib/shared-storage';
import { Users, LayoutTemplate, Layers, Wallet, Box, TrendingUp, Cpu, ShieldCheck } from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const DashboardPage = () => {
  const { state } = useSharedState();
  
  const participants = state.participants || [];
  const teams = state.teams || [];
  const submissions = state.submissions || [];
  const expenses = state.expenses || [];
  const logistics = state.logistics || [];
  const volunteers = state.volunteers || [];

  // Compute major KPIs
  const totalBudget = expenses.reduce((sum, e) => sum + (e.status !== 'Cancelled' ? e.amount : 0), 0);
  const paidBudget = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
  
  const checkedInCount = participants.filter(p => p.checkInStatus === 'Checked-In').length;
  const participantCount = participants.length;
  
  const pendingLogisticsCount = logistics.filter(l => ['Ordered', 'In Transit'].includes(l.status)).reduce((sum, l) => sum + l.quantity, 0);
  
  // Chart 1: Expenses by Category (Pie Chart)
  const expenseChartData = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach(e => {
      if (e.status !== 'Cancelled') {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
      }
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Chart 2: Participant Registrations by Track (Bar Chart)
  const trackChartData = useMemo(() => {
    const tracks: Record<string, number> = {};
    participants.forEach(p => {
      tracks[p.track] = (tracks[p.track] || 0) + 1;
    });
    return Object.entries(tracks).map(([name, value]) => ({ name, Participants: value }));
  }, [participants]);

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b'];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics Overview</h2>
          <p className="text-muted-foreground mt-1 text-sm">Real-time metrics tracking your entire hackathon lifecycle.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-lg shadow-primary/20 transition-all text-sm no-print"
        >
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Registered', value: participantCount, icon: Users, info: `${checkedInCount} checked in`, color: 'text-[#106292]', bg: 'bg-[#106292]/10' },
          { label: 'Teams', value: teams.length, icon: Layers, info: `${submissions.length} submitted`, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Budget Used', value: `₹${totalBudget.toLocaleString()}`, icon: Wallet, info: `₹${paidBudget.toLocaleString()} strictly paid`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Items', value: pendingLogisticsCount, icon: Box, info: `${logistics.length} item types`, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Volunteers', value: volunteers.length, icon: ShieldCheck, info: `${volunteers.filter(v => v.status === 'Active').length} active now`, color: 'text-indigo-600', bg: 'bg-indigo-50' }
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg p-5 border border-[#E2E8F0] shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-9 h-9 rounded-md flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-[#94A3B8]/30" />
            </div>
            <h4 className="text-2xl font-bold text-[#1B2533] tracking-tight">{stat.value}</h4>
            <div className="flex flex-col mt-1">
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">{stat.label}</p>
              <span className="text-[10px] text-[#94A3B8] font-medium mt-1">
                {stat.info}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 flex flex-col h-[380px]">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-md bg-[#106292]/10 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-[#106292]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1B2533] text-sm">Participant Breakdowns</h3>
              <p className="text-[11px] text-[#64748B] font-medium uppercase tracking-tight">Registrations per track</p>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            {trackChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trackChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#F1F5F9', opacity: 0.6 }}
                    contentStyle={{ backgroundColor: '#FFF', borderColor: '#E2E8F0', borderRadius: '8px', color: '#1B2533', fontSize: '12px', fontWeight: 600, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Participants" fill="#106292" radius={[2, 2, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#94A3B8]">
                <LayoutTemplate className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">No track data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 flex flex-col h-[380px]">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#1B2533] text-sm">Budget Allocation</h3>
              <p className="text-[11px] text-[#64748B] font-medium uppercase tracking-tight">Financial spread by category</p>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0 flex items-center justify-center">
            {expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#FFF"
                    strokeWidth={2}
                  >
                    {expenseChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#FFF', borderColor: '#E2E8F0', borderRadius: '8px', color: '#1B2533', fontSize: '12px', fontWeight: 600, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 500, color: '#64748B', paddingTop: '20px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#94A3B8]">
                <Wallet className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">No expense records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
