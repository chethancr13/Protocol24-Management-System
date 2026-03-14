import { useState, useMemo } from 'react';
import { Search, Filter, Printer, Trash2, Plus } from 'lucide-react';
import { Participant, HackathonTrack, Team } from '@/types/hackathon';
import { useSharedState } from '@/lib/shared-storage';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';

const tracks: HackathonTrack[] = ['Web', 'AI/ML', 'Blockchain', 'Open Innovation'];

const ParticipantsPage = () => {
  const { state, updateState } = useSharedState();
  const participants = state.participants || [];
  const teams = state.teams || [];
  
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('All');
  const [sortAsc, setSortAsc] = useState(true);

  // New Participant Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    track: 'Web' as HackathonTrack,
    skill: '',
  });

  const filtered = useMemo(() => {
    let list = [...participants];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
    }
    if (trackFilter !== 'All') {
      list = list.filter(p => p.track === trackFilter);
    }
    list.sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    return list;
  }, [participants, search, trackFilter, sortAsc]);

  const toggleCheckIn = (id: string) => {
    const p = participants.find(p => p.id === id);
    if (!p) return;

    updateState(prev => {
      let nextParticipants = [...prev.participants];
      let nextTeams = [...prev.teams];

      const pIdx = nextParticipants.findIndex(part => part.id === id);
      const participant = nextParticipants[pIdx];

      if (participant.checkInStatus === 'Not Checked-In' || participant.checkInStatus === 'Checked-Out') {
        nextParticipants[pIdx] = { ...participant, checkInStatus: 'Checked-In' as const };
        toast.success(`${participant.name} checked in!`);
      } else {
        // Check out: remove from team
        if (participant.teamName) {
          nextTeams = nextTeams.map(t => ({
            ...t,
            members: t.members.filter(mId => mId !== id),
          }));
          toast.info(`${participant.name} checked out and removed from team "${participant.teamName}"`);
        } else {
          toast.info(`${participant.name} checked out`);
        }
        nextParticipants[pIdx] = { ...participant, checkInStatus: 'Checked-Out' as const, teamName: null };
      }

      return { ...prev, participants: nextParticipants, teams: nextTeams };
    }, `toggled check-in for ${p.name}`);
  };

  const handleAddParticipant = () => {
    if (!newParticipant.name || !newParticipant.email || !newParticipant.skill) {
      toast.error('Please fill in all details');
      return;
    }
    
    // Add to participants array
    const participant: Participant = {
      id: crypto.randomUUID(),
      name: newParticipant.name.trim(),
      email: newParticipant.email.trim(),
      college: 'Unknown', // Default value or expand form to support
      skill: newParticipant.skill.trim(),
      track: newParticipant.track,
      checkInStatus: 'Not Checked-In',
      teamName: null,
    };

    updateState(prev => ({
      ...prev,
      participants: [...prev.participants, participant]
    }), `registered new participant: ${participant.name}`);
    
    toast.success('Participant added successfully');
    
    // Reset form
    setNewParticipant({ name: '', email: '', track: 'Web', skill: '' });
    setShowAddForm(false);
  };

  const deleteParticipant = (id: string, name: string) => {
    // Confirm delete (could use a dialog, but simple confirm for now)
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    // Must also remove them from any teams they are a part of
    updateState(prev => {
      let nextTeams = [...prev.teams];
      const p = prev.participants.find(part => part.id === id);
      if (p && p.teamName) {
        nextTeams = nextTeams.map(t => ({
          ...t,
          members: t.members.filter(mId => mId !== id),
        }));
      }
      return {
        ...prev,
        participants: prev.participants.filter(part => part.id !== id),
        teams: nextTeams
      };
    }, `deleted participant: ${name}`);
    
    toast.success('Participant deleted');
  };

  const inputClass =
    'h-9 px-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Controls */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputClass} pl-9 w-full`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select value={trackFilter} onChange={e => setTrackFilter(e.target.value)} className={inputClass}>
            <option value="All">All Tracks</option>
            {tracks.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={() => setSortAsc(!sortAsc)} className={`${inputClass} px-4 cursor-pointer hover:bg-muted/80`}>
          Sort {sortAsc ? 'A→Z' : 'Z→A'}
        </button>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 ml-auto"
        >
          <Plus className="w-4 h-4" /> Add Participant
        </button>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-all"
        >
          <Printer className="w-4 h-4" /> Print List
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card rounded-2xl p-6 gradient-border animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">Add New Participant</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              placeholder="Name"
              className={inputClass}
              value={newParticipant.name}
              onChange={e => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              placeholder="Email"
              type="email"
              className={inputClass}
              value={newParticipant.email}
              onChange={e => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
            />
            <select
              className={inputClass}
              value={newParticipant.track}
              onChange={e => setNewParticipant(prev => ({ ...prev, track: e.target.value as HackathonTrack }))}
            >
              {tracks.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              placeholder="Skill (e.g., Frontend, Python)"
              className={inputClass}
              value={newParticipant.skill}
              onChange={e => setNewParticipant(prev => ({ ...prev, skill: e.target.value }))}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={handleAddParticipant} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Add</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Name', 'Email', 'Track', 'Skill', 'Status', 'Team', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                    No participants found
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary">
                          {p.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{p.email}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-lg bg-primary/10 text-primary">{p.track}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{p.skill}</td>
                    <td className="px-5 py-3"><StatusBadge status={p.checkInStatus} /></td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{p.teamName || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCheckIn(p.id)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all active:scale-95 ${
                            p.checkInStatus === 'Checked-In'
                              ? 'bg-destructive/15 text-destructive hover:bg-destructive/25'
                              : 'bg-success/15 text-success hover:bg-success/25'
                          }`}
                        >
                          {p.checkInStatus === 'Checked-In' ? 'Check Out' : 'Check In'}
                        </button>
                        <button
                          onClick={() => deleteParticipant(p.id, p.name)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete Participant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPage;
