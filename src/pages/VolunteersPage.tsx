import { useState } from 'react';
import { useSharedState } from '@/lib/shared-storage';
import { canEdit } from '@/config/team';
import { Search, Plus, Trash2, Users, MapPin, UserCheck, Shield, Edit2, Check, X as CloseIcon } from 'lucide-react';
import { Volunteer } from '@/types/hackathon';
import { toast } from 'sonner';

const VolunteersPage = () => {
  const { state, updateState } = useSharedState();
  const volunteers = state.volunteers || [];
  const currentUser = JSON.parse(localStorage.getItem('protocol24-user') || '{}');
  const editable = canEdit(currentUser.role, 'volunteers');

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState<Partial<Volunteer>>({
    name: '',
    role: '',
    assignedRoom: '',
    status: 'Active'
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Volunteer>>({});

  const roles = ['Hall Monitor', 'Registration', 'Tech Support', 'Food/Swag', 'Operations', 'General'];

  const filtered = volunteers.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.assignedRoom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || v.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const addVolunteer = () => {
    if (!newVolunteer.name || !newVolunteer.role || !newVolunteer.assignedRoom) {
      toast.error('All fields are required');
      return;
    }
    
    const volunteer: Volunteer = {
      id: crypto.randomUUID(),
      name: newVolunteer.name,
      role: newVolunteer.role,
      assignedRoom: newVolunteer.assignedRoom,
      status: 'Active'
    };

    updateState(prev => ({
        ...prev,
        volunteers: [...(prev.volunteers || []), volunteer]
    }), `added volunteer: ${volunteer.name} as ${volunteer.role}`);

    toast.success('Volunteer added successfully');
    setNewVolunteer({ name: '', role: '', assignedRoom: '', status: 'Active' });
    setShowAddForm(false);
  };

  const deleteVolunteer = (id: string, name: string) => {
    if (!window.confirm(`Remove volunteer "${name}"?`)) return;
    updateState(prev => ({
        ...prev,
        volunteers: prev.volunteers.filter(v => v.id !== id)
    }), `removed volunteer: ${name}`);
    toast.success('Volunteer removed');
  };

  const updateStatus = (id: string, status: Volunteer['status']) => {
    const v = volunteers.find(vol => vol.id === id);
    updateState(prev => ({
        ...prev,
        volunteers: prev.volunteers.map(vol => vol.id === id ? { ...vol, status } : vol)
    }), `updated status for ${v?.name} to ${status}`);
    toast.success('Status updated');
  };

  const startEditing = (v: Volunteer) => {
    setEditingId(v.id);
    setEditForm({ ...v });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editForm.name || !editForm.role || !editForm.assignedRoom) {
      toast.error('All fields are required');
      return;
    }

    updateState(prev => ({
      ...prev,
      volunteers: prev.volunteers.map(v => v.id === editingId ? { ...v, ...editForm } as Volunteer : v)
    }), `updated details for volunteer: ${editForm.name}`);

    toast.success('Volunteer updated');
    setEditingId(null);
    setEditForm({});
  };

  const stats = {
    total: volunteers.length,
    active: volunteers.filter(v => v.status === 'Active').length,
    onBreak: volunteers.filter(v => v.status === 'On Break').length,
  };

  const inputClass = "h-10 px-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {[
          { label: 'Total Volunteers', value: stats.total, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Now', value: stats.active, icon: UserCheck, color: 'text-success', bg: 'bg-success/10' },
          { label: 'On Break', value: stats.onBreak, icon: Shield, color: 'text-amber-500', bg: 'bg-amber-500/10' }
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
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card/50 no-print">
          <h2 className="text-lg font-bold text-foreground">Volunteers & Staff Management</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name or room..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9 w-full sm:w-64`}
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className={`${inputClass} w-full sm:w-40 appearance-none`}
            >
              <option value="All">All Roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {editable && (
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Volunteer
              </button>
            )}
          </div>
        </div>

        {showAddForm && (
          <div className="p-6 bg-muted/10 border-b border-border flex flex-col gap-4 animate-fade-in no-print">
            <h3 className="text-sm font-bold">Register New Volunteer</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input placeholder="Full Name" className={inputClass} value={newVolunteer.name} onChange={e => setNewVolunteer({...newVolunteer, name: e.target.value})} />
              <select className={inputClass} value={newVolunteer.role} onChange={e => setNewVolunteer({...newVolunteer, role: e.target.value})}>
                <option value="">Select Role...</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <input placeholder="Assigned Room/Area" className={inputClass} value={newVolunteer.assignedRoom} onChange={e => setNewVolunteer({...newVolunteer, assignedRoom: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={addVolunteer} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Save Volunteer</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Volunteer Name</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-center">Assigned Room</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                        {editingId === v.id ? (
                          <input 
                            className={`${inputClass} w-full h-8`}
                            value={editForm.name}
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                          />
                        ) : (
                          <>
                            <div className="font-medium text-foreground">{v.name}</div>
                            <div className="text-[10px] text-muted-foreground opacity-70 uppercase tracking-widest">{v.id.split('-')[0]}</div>
                          </>
                        )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === v.id ? (
                        <select 
                          className={`${inputClass} w-full h-8 px-2`}
                          value={editForm.role}
                          onChange={e => setEditForm({...editForm, role: e.target.value})}
                        >
                          {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-medium">{v.role}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs">
                          {editingId === v.id ? (
                            <input 
                              className={`${inputClass} w-full h-8`}
                              value={editForm.assignedRoom}
                              onChange={e => setEditForm({...editForm, assignedRoom: e.target.value})}
                            />
                          ) : (
                            <>
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {v.assignedRoom}
                            </>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <select
                          value={v.status}
                          disabled={editingId === v.id}
                          onChange={e => updateStatus(v.id, e.target.value as any)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border appearance-none font-bold outline-none cursor-pointer text-center no-print ${
                            v.status === 'Active' ? 'bg-success/15 text-success border-success/20' :
                            v.status === 'On Break' ? 'bg-amber-500/15 text-amber-500 border-amber-500/20' :
                            'bg-muted text-muted-foreground'
                          } ${editingId === v.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="Active">Active</option>
                          <option value="On Break">On Break</option>
                          <option value="Off Duty">Off Duty</option>
                        </select>
                    </td>
                    <td className="px-6 py-4 text-right no-print">
                      {editable && (
                        <div className="flex items-center justify-end gap-2">
                          {editingId === v.id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/10 transition-colors"
                                title="Cancel"
                              >
                                <CloseIcon className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(v)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteVolunteer(v.id, v.name)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No volunteers found</p>
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

export default VolunteersPage;
