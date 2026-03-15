import { useState } from 'react';
import { Plus, X, Users, UserPlus, Trash2, Printer } from 'lucide-react';
import { Participant, Team } from '@/types/hackathon';
import { useSharedState } from '@/lib/shared-storage';
import { toast } from 'sonner';

const MAX_TEAM_SIZE = 4;

const TeamsPage = () => {
  const { state, updateState } = useSharedState();
  const participants = state.participants || [];
  const teams = state.teams || [];
  
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Record<string, string>>({});

  const availableParticipants = participants.filter(
    p => !p.teamName
  );

  const createTeam = () => {
    const name = newTeamName.trim();
    if (!name) { toast.error('Team name is required'); return; }
    if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Team name already exists');
      return;
    }
    updateState(prev => ({
      ...prev,
      teams: [...prev.teams, { id: crypto.randomUUID(), name, members: [] }]
    }), `created team: ${name}`);
    
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

    updateState(prev => {
      const nextTeams = prev.teams.map(t => t.id === teamId ? { ...t, members: [...t.members, pId] } : t);
      const nextParticipants = prev.participants.map(p => p.id === pId ? { ...p, teamName: team.name } : p);
      return { ...prev, teams: nextTeams, participants: nextParticipants };
    }, `added ${getParticipant(pId)?.name} to team ${team.name}`);

    setSelectedParticipant(prev => ({ ...prev, [teamId]: '' }));
    toast.success('Member added to team');
  };

  const removeMember = (teamId: string, pId: string) => {
    const team = teams.find(t => t.id === teamId);
    updateState(prev => {
      const nextTeams = prev.teams.map(t => t.id === teamId ? { ...t, members: t.members.filter(m => m !== pId) } : t);
      const nextParticipants = prev.participants.map(p => p.id === pId ? { ...p, teamName: null } : p);
      return { ...prev, teams: nextTeams, participants: nextParticipants };
    }, `removed ${getParticipant(pId)?.name} from team ${team?.name}`);
    
    toast.info('Member removed from team');
  };

  const deleteTeam = (teamId: string, teamName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${teamName}?`)) return;

    updateState(prev => {
      const nextTeams = prev.teams.filter(t => t.id !== teamId);
      const nextParticipants = prev.participants.map(p => p.teamName === teamName ? { ...p, teamName: null } : p);
      return { ...prev, teams: nextTeams, participants: nextParticipants };
    }, `deleted team: ${teamName}`);
    
    toast.success('Team deleted');
  };

  const getParticipant = (id: string) => participants.find(p => p.id === id);

  const inputClass =
    'h-10 px-4 rounded-md bg-white border border-[#CBD5E1] text-[13px] text-[#1B2533] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#106292] focus:ring-1 focus:ring-[#106292]/20 transition-all';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Create team */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#1B2533] uppercase tracking-wider mb-5 flex items-center gap-2">
          <div className="w-2 h-4 bg-[#106292] rounded-full" />
          Create New Team
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
            className="h-10 px-6 rounded-md bg-[#106292] text-white text-[13px] font-bold hover:bg-[#0D547D] transition-colors shadow-sm"
          >
            Create Team
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 h-10 px-4 rounded-md bg-white border border-[#E2E8F0] text-[#475569] text-[13px] font-bold hover:bg-[#F8FAFC] transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Teams grid */}
      {teams.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-[#94A3B8]" />
          </div>
          <h3 className="text-base font-bold text-[#1B2533] mb-2">No teams found</h3>
          <p className="text-sm text-[#64748B]">Start by creating a new team using the form above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map(team => (
            <div key={team.id} className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-[#106292]/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#106292]" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#1B2533] leading-tight">{team.name}</h4>
                    <p className="text-[11px] font-bold text-[#64748B] uppercase mt-0.5">{team.members.length}/{MAX_TEAM_SIZE} members</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-16 md:w-20 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#106292] transition-all"
                      style={{ width: `${(team.members.length / MAX_TEAM_SIZE) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => deleteTeam(team.id, team.name)}
                    className="p-1.5 rounded-md text-[#CBD5E1] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Members */}
              <div className="space-y-2 mb-6 flex-1">
                {team.members.map(mId => {
                  const p = getParticipant(mId);
                  if (!p) return null;
                  return (
                    <div key={mId} className="flex items-center justify-between p-3 rounded-md bg-[#F8FAFC] border border-[#F1F5F9]">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-sm bg-[#106292]/10 flex items-center justify-center text-[10px] font-bold text-[#106292]">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#1B2533] leading-tight">{p.name}</p>
                          <p className="text-[11px] text-[#64748B] font-medium">{p.skill}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeMember(team.id, mId)}
                        className="w-6 h-6 rounded-md hover:bg-rose-50 flex items-center justify-center transition-colors group"
                      >
                        <X className="w-3.5 h-3.5 text-[#CBD5E1] group-hover:text-rose-600" />
                      </button>
                    </div>
                  );
                })}
                {team.members.length === 0 && (
                  <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-lg">
                    <p className="text-[11px] font-bold text-[#94A3B8] uppercase">Empty Team</p>
                  </div>
                )}
              </div>

              {/* Add member */}
              {team.members.length < MAX_TEAM_SIZE && (
                <div className="flex gap-2 pt-4 border-t border-[#F1F5F9]">
                  <select
                    value={selectedParticipant[team.id] || ''}
                    onChange={e => setSelectedParticipant(prev => ({ ...prev, [team.id]: e.target.value }))}
                    className={`${inputClass} flex-1 text-[12px] font-medium`}
                  >
                    <option value="">Select participant...</option>
                    {availableParticipants.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — {p.skill}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => addMember(team.id)}
                    className="h-10 w-10 shrink-0 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center hover:bg-emerald-100 transition-colors group"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
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
