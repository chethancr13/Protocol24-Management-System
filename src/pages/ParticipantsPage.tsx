import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Participant, HackathonTrack, Team } from '@/types/hackathon';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';

const tracks: HackathonTrack[] = ['Web', 'AI/ML', 'Blockchain', 'Open Innovation'];

const ParticipantsPage = () => {
  const [participants, setParticipants] = useLocalStorage<Participant[]>('hackathon-participants', []);
  const [teams, setTeams] = useLocalStorage<Team[]>('hackathon-teams', []);
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('All');
  const [sortAsc, setSortAsc] = useState(true);

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
    setParticipants(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        if (p.checkInStatus === 'Not Checked-In' || p.checkInStatus === 'Checked-Out') {
          toast.success(`${p.name} checked in!`);
          return { ...p, checkInStatus: 'Checked-In' as const };
        }
        // Check out: remove from team
        if (p.teamName) {
          setTeams(prevTeams =>
            prevTeams.map(t => ({
              ...t,
              members: t.members.filter(mId => mId !== id),
            }))
          );
          toast.info(`${p.name} checked out and removed from team "${p.teamName}"`);
          return { ...p, checkInStatus: 'Checked-Out' as const, teamName: null };
        }
        toast.info(`${p.name} checked out`);
        return { ...p, checkInStatus: 'Checked-Out' as const };
      })
    );
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
      </div>

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
