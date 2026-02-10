import { useState } from 'react';
import { Plus, X, Users, UserPlus } from 'lucide-react';
import { Participant, Team } from '@/types/hackathon';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

const MAX_TEAM_SIZE = 4;

const TeamsPage = () => {
  const [participants, setParticipants] = useLocalStorage<Participant[]>('hackathon-participants', []);
  const [teams, setTeams] = useLocalStorage<Team[]>('hackathon-teams', []);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Record<string, string>>({});

  const availableParticipants = participants.filter(
    p => p.checkInStatus === 'Checked-In' && !p.teamName
  );

  const createTeam = () => {
    const name = newTeamName.trim();
    if (!name) { toast.error('Team name is required'); return; }
    if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Team name already exists');
      return;
    }
    setTeams(prev => [...prev, { id: crypto.randomUUID(), name, members: [] }]);
    setNewTeamName('');
    toast.success(`Team "${name}" created!`);
  };

  const addMember = (teamId: string) => {
    const pId = selectedParticipant[teamId];
    if (!pId) return;

    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    if (team.members.length >= MAX_TEAM_SIZE) {
      toast.error(`Maximum ${MAX_TEAM_SIZE} members per team`);
      return;
    }

    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: [...t.members, pId] } : t));
    setParticipants(prev => prev.map(p => p.id === pId ? { ...p, teamName: team.name } : p));
    setSelectedParticipant(prev => ({ ...prev, [teamId]: '' }));
    toast.success('Member added to team');
  };

  const removeMember = (teamId: string, pId: string) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: t.members.filter(m => m !== pId) } : t));
    setParticipants(prev => prev.map(p => p.id === pId ? { ...p, teamName: null } : p));
    toast.info('Member removed from team');
  };

  const getParticipant = (id: string) => participants.find(p => p.id === id);

  const inputClass =
    'h-10 px-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Create team */}
      <div className="glass-card rounded-2xl p-6 gradient-border">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Create New Team
        </h3>
        <div className="flex gap-3">
          <input
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
            placeholder="Enter team name..."
            className={`${inputClass} flex-1`}
            maxLength={50}
            onKeyDown={e => e.key === 'Enter' && createTeam()}
          />
          <button
            onClick={createTeam}
            className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            Create
          </button>
        </div>
      </div>

      {/* Teams grid */}
      {teams.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No teams yet. Create your first team above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map(team => (
            <div key={team.id} className="glass-card-hover rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{team.name}</h4>
                    <p className="text-xs text-muted-foreground">{team.members.length}/{MAX_TEAM_SIZE} members</p>
                  </div>
                </div>
                <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${(team.members.length / MAX_TEAM_SIZE) * 100}%` }}
                  />
                </div>
              </div>

              {/* Members */}
              <div className="space-y-2 mb-4">
                {team.members.map(mId => {
                  const p = getParticipant(mId);
                  if (!p) return null;
                  return (
                    <div key={mId} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center text-[9px] font-bold text-primary">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.skill}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeMember(team.id, mId)}
                        className="w-6 h-6 rounded-md bg-destructive/15 flex items-center justify-center hover:bg-destructive/25 transition-colors"
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add member */}
              {team.members.length < MAX_TEAM_SIZE && (
                <div className="flex gap-2">
                  <select
                    value={selectedParticipant[team.id] || ''}
                    onChange={e => setSelectedParticipant(prev => ({ ...prev, [team.id]: e.target.value }))}
                    className={`${inputClass} flex-1 text-xs`}
                  >
                    <option value="">Select participant...</option>
                    {availableParticipants.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — {p.skill}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => addMember(team.id)}
                    className="h-10 w-10 rounded-xl bg-success/15 flex items-center justify-center hover:bg-success/25 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-success" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
