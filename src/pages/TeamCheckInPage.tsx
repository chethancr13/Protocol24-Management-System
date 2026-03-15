import { useState } from 'react';
import { useSharedState } from '@/lib/shared-storage';
import { canEdit } from '@/config/team';
import { Search, Download, ClipboardCheck, Clock, Users } from 'lucide-react';
import { Team, CheckInStatus } from '@/types/hackathon';
import { toast } from 'sonner';

// Quick utility to format dates
const formatTime = (isoString?: string) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const TeamCheckInPage = () => {
  const { state, updateState } = useSharedState();
  const teams = state.teams || [];
  const currentUser = JSON.parse(localStorage.getItem('protocol24-user') || '{}');
  const editable = canEdit(currentUser.role, 'check-in');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CheckInStatus | 'All'>('All');

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) || team.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (team.checkInStatus || 'Not Checked-In') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleCheckIn = (teamId: string) => {
    if (!editable) {
        toast.error('You do not have permission to check-in teams');
        return;
    }
    
    const team = teams.find(t => t.id === teamId);
    const isCurrentlyCheckedIn = team?.checkInStatus === 'Checked-In';
    
    updateState(prev => ({
        ...prev,
        teams: prev.teams.map(t => {
            if (t.id === teamId) {
                return {
                    ...t,
                    checkInStatus: isCurrentlyCheckedIn ? 'Not Checked-In' : 'Checked-In',
                    checkInTime: isCurrentlyCheckedIn ? undefined : new Date().toISOString()
                };
            }
            return t;
        })
    }), isCurrentlyCheckedIn ? `undid check-in for team: ${team?.name}` : `checked in team: ${team?.name}`);
    
    toast.success('Check-in status updated');
  };

  const exportCSV = () => {
    const rows = [
      ['Team ID', 'Team Name', 'Members Count', 'Status', 'Check-in Time', 'Seat Assigned'],
    ];

    teams.forEach(t => {
      rows.push([
        t.id,
        t.name,
        t.members.length.toString(),
        t.checkInStatus || 'Not Checked-In',
        t.checkInTime ? formatTime(t.checkInTime) : 'N/A',
        t.seatAssigned || 'None',
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "team_checkin.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Check-in list exported');
  };

  const stats = {
    total: teams.length,
    checkedIn: teams.filter(t => t.checkInStatus === 'Checked-In').length,
    pending: teams.filter(t => t.checkInStatus !== 'Checked-In').length,
  };

  const inputClass = "h-10 px-4 rounded-md bg-white border border-[#CBD5E1] text-[13px] text-[#1B2533] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#106292] focus:ring-1 focus:ring-[#106292]/20 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {[
          { label: 'Registered Teams', value: stats.total, icon: Users, color: 'text-[#106292]', bg: 'bg-[#106292]/10' },
          { label: 'Validated Entry', value: stats.checkedIn, icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Awaiting Check-In', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg p-5 border border-[#E2E8F0] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className="text-2xl font-bold text-[#1B2533]">{stat.value}</h4>
            </div>
            <div className={`w-10 h-10 rounded-md flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Header & Filters */}
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white no-print">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <h2 className="text-sm font-bold text-[#1B2533] uppercase tracking-[0.1em]">Team Verification Desk</h2>
            <button 
              onClick={exportCSV} 
              className="px-3 py-1.5 rounded-md bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] transition-colors flex items-center gap-2 text-[11px] font-bold shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> EXPORT REPORT
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search team name or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9 w-full sm:w-64`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as CheckInStatus | 'All')}
              className={`${inputClass} w-full sm:w-48 appearance-none font-medium`}
            >
              <option value="All">All Entry States</option>
              <option value="Not Checked-In">Not Checked-In</option>
              <option value="Checked-In">Checked-In</option>
            </select>
          </div>
        </div>

        {/* List of Teams */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] uppercase tracking-[0.1em] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 font-bold">Team Credentials</th>
                <th className="px-6 py-4 font-bold">Quotas</th>
                <th className="px-6 py-4 font-bold">Workspace</th>
                <th className="px-6 py-4 font-bold">Security Stamp</th>
                <th className="px-6 py-4 text-right font-bold">Admission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white text-[13px]">
              {filteredTeams.length > 0 ? (
                filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#1B2533]">{team.name}</div>
                      <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">ID: {team.id.substring(0,8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[#475569] font-medium">
                        <Users className="w-4 h-4 text-[#94A3B8]" />
                        <span>{team.members.length} / 4 Members</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {team.seatAssigned ? (
                        <div className="flex items-center gap-2 text-[#106292] font-bold italic">
                           <div className="w-1.5 h-3 bg-[#106292]/20 rounded-full" />
                           {team.seatAssigned}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8] font-medium italic">Unallocated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#64748B] font-medium">
                      {team.checkInStatus === 'Checked-In' ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase text-[11px] tracking-tight">
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          Authenticated @ {formatTime(team.checkInTime)}
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-[#94A3B8] uppercase">Waiting Registration</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editable ? (
                        <button
                          onClick={() => toggleCheckIn(team.id)}
                          className={`min-w-[130px] px-5 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm ${
                            team.checkInStatus === 'Checked-In'
                              ? 'bg-white text-rose-600 border border-rose-100 hover:bg-rose-50'
                              : 'bg-[#106292] text-white hover:bg-[#0D547D]'
                          }`}
                        >
                          {team.checkInStatus === 'Checked-In' ? 'REVOKE ENTRY' : 'GRANT ACCESS'}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-[#94A3B8] bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">Supervisory Only</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center text-[#94A3B8]">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardCheck className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-sm font-medium">No team records found under current parameters</p>
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

export default TeamCheckInPage;
