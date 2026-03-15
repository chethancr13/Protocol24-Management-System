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
    }), `updated status for "${v?.name}" to ${status} (${v?.role})`);
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

  const inputClass = "h-10 px-4 rounded-md bg-white border border-[#CBD5E1] text-[13px] text-[#1B2533] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#106292] focus:ring-1 focus:ring-[#106292]/20 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {[
          { label: 'Total Volunteers', value: stats.total, icon: Users, color: 'text-[#106292]', bg: 'bg-[#106292]/10' },
          { label: 'Active Personnel', value: stats.active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Off-Duty/Break', value: stats.onBreak, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' }
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
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white no-print">
          <h2 className="text-sm font-bold text-[#1B2533] uppercase tracking-[0.1em]">Volunteer Roster</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto text-sm font-semibold">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9 w-full sm:w-56`}
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className={`${inputClass} w-full sm:w-40 appearance-none font-medium`}
            >
              <option value="All">All Roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {editable && (
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center justify-center gap-2 h-10 px-5 rounded-md bg-[#106292] text-white text-[13px] font-bold hover:bg-[#0D547D] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Recruit Staff
              </button>
            )}
          </div>
        </div>

        {showAddForm && (
          <div className="p-6 bg-slate-50 border-b border-[#E2E8F0] flex flex-col gap-5 animate-fade-in no-print ring-1 ring-inset ring-[#E2E8F0]">
            <h3 className="text-xs font-bold text-[#1B2533] uppercase tracking-wider flex items-center gap-2">
               <div className="w-1.5 h-3 bg-[#106292] rounded-full" />
               New Staff Registration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Legal Name</label>
                <input placeholder="Full Name" className={inputClass} value={newVolunteer.name} onChange={e => setNewVolunteer({...newVolunteer, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Functional Role</label>
                <select className={`${inputClass} font-medium`} value={newVolunteer.role} onChange={e => setNewVolunteer({...newVolunteer, role: e.target.value})}>
                  <option value="">Select Role...</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Assignment Area</label>
                <input placeholder="Room / Zone" className={inputClass} value={newVolunteer.assignedRoom} onChange={e => setNewVolunteer({...newVolunteer, assignedRoom: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowAddForm(false)} className="px-5 py-2 text-[13px] font-bold text-[#64748B] hover:text-[#1B2533]">Cancel</button>
              <button onClick={addVolunteer} className="px-6 py-2 rounded-md bg-[#106292] text-white text-[13px] font-bold hover:bg-[#0D547D] shadow-sm">Save Personnel</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] uppercase tracking-[0.1em] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 font-bold">Staff Member</th>
                <th className="px-6 py-4 font-bold">Designation</th>
                <th className="px-6 py-4 text-center font-bold">Location</th>
                <th className="px-6 py-4 text-center font-bold">Current Status</th>
                <th className="px-6 py-4 text-right no-print font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white">
              {filtered.length > 0 ? (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="px-6 py-4">
                        {editingId === v.id ? (
                          <input 
                            className={`${inputClass} w-full h-8 px-2`}
                            value={editForm.name}
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                          />
                        ) : (
                          <div>
                            <div className="font-bold text-[#1B2533]">{v.name}</div>
                            <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">{v.id.split('-')[0]}</div>
                          </div>
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
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-md text-[11px] font-bold text-[#475569] uppercase tracking-tight">{v.role}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-[12px] font-medium text-[#64748B]">
                          {editingId === v.id ? (
                            <input 
                              className={`${inputClass} w-full h-8 px-2`}
                              value={editForm.assignedRoom}
                              onChange={e => setEditForm({...editForm, assignedRoom: e.target.value})}
                            />
                          ) : (
                            <>
                              <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
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
                          className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border appearance-none outline-none cursor-pointer text-center no-print transition-colors ${
                            v.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            v.status === 'On Break' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-slate-50 text-slate-500 border-slate-100'
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
                                className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1.5 rounded-md text-[#CBD5E1] hover:text-[#475569] hover:bg-slate-50 transition-colors"
                                title="Cancel"
                              >
                                <CloseIcon className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(v)}
                                className="p-1.5 rounded-md text-[#CBD5E1] hover:text-[#106292] hover:bg-[#106292]/5 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteVolunteer(v.id, v.name)}
                                className="p-1.5 rounded-md text-[#CBD5E1] hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
                  <td colSpan={5} className="px-6 py-20 text-center text-[#94A3B8]">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-sm font-medium">No personnel currently listed</p>
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
