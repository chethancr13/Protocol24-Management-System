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

  const inputClass = "h-10 px-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Teams', value: stats.total, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Checked In', value: stats.checkedIn, icon: ClipboardCheck, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pending Arrival', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' }
        ].map(stat => (
          <div key={stat.label} className="glass-card rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
              <h4 className="text-2xl font-bold text-foreground">{stat.value}</h4>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        {/* Header & Filters */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card/50">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <h2 className="text-lg font-bold text-foreground">Team Check-In</h2>
            <button 
              onClick={exportCSV} 
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5 text-xs font-semibold ml-auto sm:ml-0"
            >
              <Download className="w-3.5 h-3.5" /> Export DB
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9 w-full sm:w-64`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as CheckInStatus | 'All')}
              className={`${inputClass} w-full sm:w-48 appearance-none`}
            >
              <option value="All">All Statuses</option>
              <option value="Not Checked-In">Not Checked-In</option>
              <option value="Checked-In">Checked-In</option>
            </select>
          </div>
        </div>

        {/* List of Teams */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Team Info</th>
                <th className="px-6 py-4 font-medium">Members</th>
                <th className="px-6 py-4 font-medium">Seat Assigned</th>
                <th className="px-6 py-4 font-medium">Check-In Time</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTeams.length > 0 ? (
                filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{team.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase opacity-70">ID: {team.id.substring(0,8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{team.members.length}/4</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {team.seatAssigned ? (
                        <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent border border-accent/20 text-xs font-semibold">
                          {team.seatAssigned}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {team.checkInStatus === 'Checked-In' ? (
                        <span className="flex items-center gap-1.5 text-foreground">
                          <Clock className="w-3.5 h-3.5 text-success" />
                          {formatTime(team.checkInTime)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editable ? (
                        <button
                          onClick={() => toggleCheckIn(team.id)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                            team.checkInStatus === 'Checked-In'
                              ? 'bg-muted text-muted-foreground border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20'
                              : 'bg-success/90 text-success-foreground hover:bg-success shadow-success/20'
                          }`}
                        >
                          {team.checkInStatus === 'Checked-In' ? 'Undo Check-In' : 'Mark Checked-In'}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-muted-foreground opacity-50">Auth Req</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <ClipboardCheck className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No teams found matching your filters</p>
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
