import { useState } from 'react';
import { useSharedState } from '@/lib/shared-storage';
import { TEAM_ACCOUNTS } from '@/config/team';
import { Clock, Search, Filter, Calendar, User, Zap, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LogsPage = () => {
  const { state } = useSharedState();
  const logs = state.activityFeed || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || log.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const groupLogsByDate = (logs: any[]) => {
    const groups: Record<string, any[]> = {};
    logs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return groups;
  };

  const groupedLogs = groupLogsByDate(filteredLogs);

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Role', 'Action'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.userName,
        log.role,
        log.action
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Search and Filter */}
      <div className="glass-card rounded-2xl p-6 border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs by user or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
            >
              <option value="all">All Roles</option>
              {Object.keys(TEAM_ACCOUNTS).map(role => (
                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={exportLogs}
            className="h-10 px-4 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-sm font-medium flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="space-y-8">
        {Object.entries(groupedLogs).length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-border/50">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No logs found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
              We couldn't find any activities matching your search or filters. Try adjusting your criteria.
            </p>
          </div>
        ) : (
          Object.entries(groupedLogs).map(([date, items]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{date}</h3>
              </div>
              
              <div className="glass-card rounded-2xl overflow-hidden border border-border shadow-sm">
                <div className="divide-y divide-border/50">
                  <AnimatePresence mode="popLayout">
                    {items.map((log) => {
                      const account = TEAM_ACCOUNTS[log.role as any] || { color: '#888' };
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={log.id}
                          className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-border/50 bg-background shadow-sm flex-shrink-0">
                            <span className="text-sm font-bold" style={{ color: account.color }}>
                              {log.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-foreground">{log.userName}</span>
                              <span 
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                                style={{ 
                                  backgroundColor: account.color + '15',
                                  borderColor: account.color + '30',
                                  color: account.color 
                                }}
                              >
                                {log.role}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{log.action}</p>
                          </div>
                          
                          <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted text-[10px] font-mono text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-success font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                              <Zap className="w-2.5 h-2.5" />
                              Network Verified
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] py-8 border-t border-border/50">
        <Zap className="w-3 h-3 text-primary animate-pulse" />
        End of Audit Trail
      </div>
    </div>
  );
};

export default LogsPage;
