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
    }, `${p.checkInStatus === 'Checked-In' ? 'checked out' : 'checked in'} participant: ${p.name}`);
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
    'h-9 px-3 rounded-md bg-white border border-[#CBD5E1] text-[13px] text-[#1B2533] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#106292] focus:ring-1 focus:ring-[#106292]/20 transition-all';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Controls */}
      <div className="bg-white rounded-lg p-4 border border-[#E2E8F0] shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search participants by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputClass} pl-9 w-full`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#64748B]" />
          <select value={trackFilter} onChange={e => setTrackFilter(e.target.value)} className={`${inputClass} font-medium`}>
            <option value="All">All Tracks</option>
            {tracks.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={() => setSortAsc(!sortAsc)} className={`${inputClass} px-4 font-semibold hover:bg-[#F8FAFC]`}>
          Sort {sortAsc ? 'A→Z' : 'Z→A'}
        </button>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 h-9 px-4 rounded-md bg-[#106292] text-white text-[13px] font-bold hover:bg-[#0D547D] ml-auto transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Participant
        </button>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 h-9 px-4 rounded-md bg-white border border-[#E2E8F0] text-[#475569] text-[13px] font-bold hover:bg-[#F8FAFC] transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" /> Export
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg border border-[#106292]/20 shadow-md p-6 animate-fade-in ring-1 ring-[#106292]/5">
          <h3 className="text-sm font-bold text-[#1B2533] uppercase tracking-wider mb-5 flex items-center gap-2">
            <div className="w-2 h-4 bg-[#106292] rounded-full" />
            New Registration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Full Name</label>
              <input
                placeholder="Name"
                className={`${inputClass} w-full`}
                value={newParticipant.name}
                onChange={e => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Email Address</label>
              <input
                placeholder="Email"
                type="email"
                className={`${inputClass} w-full`}
                value={newParticipant.email}
                onChange={e => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Track Selection</label>
              <select
                className={`${inputClass} w-full font-medium`}
                value={newParticipant.track}
                onChange={e => setNewParticipant(prev => ({ ...prev, track: e.target.value as HackathonTrack }))}
              >
                {tracks.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Primary Skill</label>
              <input
                placeholder="e.g. React, Python"
                className={`${inputClass} w-full`}
                value={newParticipant.skill}
                onChange={e => setNewParticipant(prev => ({ ...prev, skill: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
            <button onClick={() => setShowAddForm(false)} className="px-5 py-2 text-[13px] font-bold text-[#64748B] hover:text-[#1B2533]">Cancel</button>
            <button onClick={handleAddParticipant} className="px-6 py-2 rounded-md bg-[#106292] text-white text-[13px] font-bold hover:bg-[#0D547D] shadow-sm">Complete Registration</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {['Name', 'Email', 'Track', 'Skill', 'Status', 'Team', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-[#64748B] uppercase tracking-[0.1em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-sm text-[#94A3B8]">
                    No participants found matching your criteria
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-[#F8FAFC]/80 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#106292]/10 flex items-center justify-center text-[10px] font-bold text-[#106292]">
                          {p.name.charAt(0)}
                        </div>
                        <span className="text-[13px] font-semibold text-[#1B2533]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[#475569]">{p.email}</td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[#475569] border border-[#E2E8F0]">{p.track}</span>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[#475569] font-medium">{p.skill}</td>
                    <td className="px-5 py-3"><StatusBadge status={p.checkInStatus} /></td>
                    <td className="px-5 py-3 text-[13px] text-[#64748B] font-medium italic">{p.teamName || 'Unassigned'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCheckIn(p.id)}
                          className={`text-[12px] font-bold px-3 py-1.5 rounded-md transition-all active:scale-95 ${
                            p.checkInStatus === 'Checked-In'
                              ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                          }`}
                        >
                          {p.checkInStatus === 'Checked-In' ? 'Check Out' : 'Check In'}
                        </button>
                        <button
                          onClick={() => deleteParticipant(p.id, p.name)}
                          className="p-1.5 rounded-md text-[#CBD5E1] hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
