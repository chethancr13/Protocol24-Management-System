import { useSharedState } from '@/lib/shared-storage';
import { History, Search, Filter, Clock, User, Info } from 'lucide-react';
import { useState } from 'react';

const LogsPage = () => {
  const { state } = useSharedState();
  const activities = [...(state.activityFeed || [])].reverse();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filteredLogs = activities.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'All' || log.action.toLowerCase().includes(actionFilter || '');
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('created') || lowerAction.includes('added') || lowerAction.includes('register')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (lowerAction.includes('deleted') || lowerAction.includes('removed')) return 'text-rose-600 bg-rose-50 border-rose-100';
    if (lowerAction.includes('updated') || lowerAction.includes('modified') || lowerAction.includes('set')) return 'text-[#106292] bg-[#106292]/5 border-[#106292]/10';
    return 'text-slate-600 bg-slate-50 border-slate-100';
  };

  const inputClass = "h-10 px-4 rounded-md bg-white border border-[#CBD5E1] text-[13px] text-[#1B2533] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#106292] focus:ring-1 focus:ring-[#106292]/20 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Header & Controls */}
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white no-print">
          <div>
            <h2 className="text-sm font-bold text-[#1B2533] uppercase tracking-[0.1em] flex items-center gap-2">
              <History className="w-4 h-4 text-[#106292]" />
               Audit Logs & Activity
            </h2>
            <p className="text-[11px] font-medium text-[#64748B] mt-1">Real-time record of all administrative actions</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto text-sm font-semibold">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9 w-full sm:w-56`}
              />
            </div>
            
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className={`${inputClass} w-full sm:w-40 appearance-none font-medium`}
            >
              <option value="All">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
              <option value="registered">Registered</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto font-medium">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] uppercase tracking-[0.1em] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2 text-[#64748B]">
                         <Clock className="w-3.5 h-3.5" />
                         <span>{new Date(log.timestamp).toLocaleString()}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-[#475569]">
                          {log.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-[#1B2533]">{log.userName} <span className="text-[10px] font-bold text-[#94A3B8] uppercase ml-1">({log.role})</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`shrink-0 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-tight ${getActionColor(log.action)}`}>
                          {log.action.split(':')[0]}
                        </span>
                        <span className="text-[#475569] leading-relaxed truncate max-w-md">{log.action}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-[#94A3B8]">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-sm font-medium">No activity logs found matching your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
