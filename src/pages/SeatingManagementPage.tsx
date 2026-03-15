import { useState, useMemo } from 'react';
import { Download, Users, Grid2X2, Filter, Info, Printer, MapPin, Plus, Trash2 } from 'lucide-react';
import { useSharedState } from '@/lib/shared-storage';
import { canEdit } from '@/config/team';
import { Team, SeatingLocation, SeatingTable } from '@/types/hackathon';
import { toast } from 'sonner';

const defaultLocations: SeatingLocation[] = [
  {
    id: 'loc-lab1',
    name: 'Lab 1',
    layoutType: 'grid',
    tables: [
      { id: 't1', tableNumber: 1, seatCount: 4 },
      { id: 't2', tableNumber: 2, seatCount: 4 },
    ]
  },
  {
    id: 'loc-seminar',
    name: 'Seminar Hall',
    layoutType: 'theater-3-row',
    tables: [
      { id: 't3', tableNumber: 1, seatCount: 3 },
    ]
  }
];

const SeatingManagementPage = () => {
  const { state, updateState } = useSharedState();
  const teams = state.teams || [];
  const locations = state.seating.length > 0 ? state.seating : defaultLocations;
  
  const currentUser = JSON.parse(localStorage.getItem('protocol24-user') || '{}');
  const editable = canEdit(currentUser.role, 'seating');

  const [activeLocationId, setActiveLocationId] = useState<string>(locations[0]?.id || '');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationLayout, setNewLocationLayout] = useState<'grid' | 'theater-2-row' | 'theater-3-row'>('grid');
  
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTableSeats, setNewTableSeats] = useState<number>(4);

  const activeLocation = locations.find(l => l.id === activeLocationId);
  const selectedTable = activeLocation?.tables.find(t => t.id === selectedTableId);

  // Helper mapping: "loc-1::t-1"
  const getTableAssignKey = (locId: string, tableId: string) => `${locId}::${tableId}`;

  const getTableStatus = (locId: string, tableId: string): 'Empty' | 'Occupied' => {
    const key = getTableAssignKey(locId, tableId);
    const assignedTeam = teams.find(t => t.seatAssigned === key);
    return assignedTeam ? 'Occupied' : 'Empty';
  };

  const activeLocationStats = useMemo(() => {
    if (!activeLocation) return { total: 0, occupied: 0, empty: 0 };
    const stats = { total: activeLocation.tables.length, occupied: 0, empty: 0 };
    activeLocation.tables.forEach(t => {
      const status = getTableStatus(activeLocation.id, t.id);
      if (status === 'Occupied') stats.occupied++;
      else stats.empty++;
    });
    return stats;
  }, [activeLocation, teams]);

  const handleTableClick = (table: SeatingTable) => {
    if (!activeLocation) return;
    setSelectedTableId(table.id);
    const key = getTableAssignKey(activeLocation.id, table.id);
    const assignedTeam = teams.find(t => t.seatAssigned === key);
    setSelectedTeamId(assignedTeam ? assignedTeam.id : '');
  };

  const assignTable = () => {
    if (!activeLocation || !selectedTable) return;
    const key = getTableAssignKey(activeLocation.id, selectedTable.id);
    
    // Check if the team is already too large for the table
    const targetTeam = teams.find(t => t.id === selectedTeamId);
    if (targetTeam && targetTeam.members.length > selectedTable.seatCount) {
      toast.warning(`Team has ${targetTeam.members.length} members but table only has ${selectedTable.seatCount} seats! Assigning anyway.`);
    }
    
    const updatedTeams = teams.map(t => {
      // Unassign any team previously at this table
      if (t.seatAssigned === key) {
        return { ...t, seatAssigned: null };
      }
      // Assign new team
      if (t.id === selectedTeamId) {
        return { ...t, seatAssigned: key };
      }
      return t;
    });

    updateState(prev => ({
        ...prev,
        teams: updatedTeams
    }), `assigned team ${targetTeam?.name} to ${activeLocation.name} - Table ${selectedTable.tableNumber}`);

    toast.success('Team assigned to table successfully');
    setSelectedTableId(null);
  };

  const unassignTable = () => {
    if (!activeLocation || !selectedTable) return;
    const key = getTableAssignKey(activeLocation.id, selectedTable.id);
    
    updateState(prev => ({
        ...prev,
        teams: prev.teams.map(t => t.seatAssigned === key ? { ...t, seatAssigned: null } : t)
    }), `cleared assignment for Table ${selectedTable.tableNumber} in ${activeLocation.name}`);
    
    toast.info('Table unassigned');
    setSelectedTableId(null);
  };

  // Add Location
  const addLocation = () => {
    if (!newLocationName.trim()) return;
    const newLoc: SeatingLocation = {
      id: `loc-${crypto.randomUUID()}`,
      name: newLocationName.trim(),
      layoutType: newLocationLayout,
      tables: []
    };
    
    updateState(prev => ({
        ...prev,
        seating: [...(prev.seating.length > 0 ? prev.seating : defaultLocations), newLoc]
    }), `created new location: ${newLoc.name}`);

    setActiveLocationId(newLoc.id);
    setNewLocationName('');
    setNewLocationLayout('grid');
    setShowAddLocation(false);
    toast.success('Location created');
  };

  // Add Table
  const addTable = () => {
    if (!activeLocationId) return;
    
    updateState(prev => ({
        ...prev,
        seating: (prev.seating.length > 0 ? prev.seating : defaultLocations).map(l => {
            if (l.id === activeLocationId) {
                const nextTableNum = l.tables.length > 0 ? Math.max(...l.tables.map(t => t.tableNumber)) + 1 : 1;
                return {
                    ...l,
                    tables: [...l.tables, { id: `t-${crypto.randomUUID()}`, tableNumber: nextTableNum, seatCount: newTableSeats }]
                };
            }
            return l;
        })
    }), `added table to ${activeLocation?.name}`);

    setShowAddTable(false);
    setNewTableSeats(4);
    toast.success('Table added');
  };

  // Delete Table
  const deleteTable = (tableId: string) => {
    if (!activeLocationId) return;
    if (!window.confirm('Delete this table? Any assigned team will be unseated.')) return;
    
    const key = getTableAssignKey(activeLocationId, tableId);
    
    updateState(prev => ({
        ...prev,
        teams: prev.teams.map(t => t.seatAssigned === key ? { ...t, seatAssigned: null } : t),
        seating: (prev.seating.length > 0 ? prev.seating : defaultLocations).map(l => {
            if (l.id === activeLocationId) {
                return { ...l, tables: l.tables.filter(t => t.id !== tableId) };
            }
            return l;
        })
    }), `deleted a table in ${activeLocation?.name}`);

    if (selectedTableId === tableId) setSelectedTableId(null);
    toast.success('Table deleted');
  };

  // Delete Location
  const deleteLocation = (locId: string) => {
    if (!window.confirm('Delete this entire location? All tables and assignments inside will be wiped.')) return;
    
    updateState(prev => {
        const nextLocs = (prev.seating.length > 0 ? prev.seating : defaultLocations).filter(l => l.id !== locId);
        if (activeLocationId === locId) {
            setActiveLocationId(nextLocs[0]?.id || '');
            setSelectedTableId(null);
        }
        return {
            ...prev,
            teams: prev.teams.map(t => t.seatAssigned?.startsWith(`${locId}::`) ? { ...t, seatAssigned: null } : t),
            seating: nextLocs
        };
    }, `deleted location: ${activeLocation?.name}`);

    toast.success('Location removed');
  };

  const exportCSV = () => {
    const rows = [['Location', 'Table', 'Seat Count', 'Status', 'Assigned Team', 'Team Members']];

    locations.forEach(loc => {
      loc.tables.forEach(table => {
        const key = getTableAssignKey(loc.id, table.id);
        const assignedTeam = teams.find(t => t.seatAssigned === key);
        rows.push([
          loc.name,
          `Table ${table.tableNumber}`,
          table.seatCount.toString(),
          assignedTeam ? 'Occupied' : 'Empty',
          assignedTeam ? assignedTeam.name : 'N/A',
          assignedTeam ? assignedTeam.members.length.toString() : '0'
        ]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "advanced_seating_chart.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Seating chart exported');
  };

  // Draw explicit positions for N seats
  const getSeatPositions = (count: number) => {
    if (count === 3) return ["-top-3 left-1/2 -translate-x-1/2", "-bottom-3 left-1/4 -translate-x-1/2", "-bottom-3 right-1/4 translate-x-1/2"];
    if (count === 4) return ["-top-3 left-1/2 -translate-x-1/2", "top-1/2 -right-3 -translate-y-1/2", "-bottom-3 left-1/2 -translate-x-1/2", "top-1/2 -left-3 -translate-y-1/2"];
    if (count === 5) return ["-top-3 left-1/4", "-top-3 right-1/4", "top-1/2 -right-3 -translate-y-1/2", "-bottom-3 left-1/2 -translate-x-1/2", "top-1/2 -left-3 -translate-y-1/2"];
    if (count === 6) return ["-top-3 left-1/4", "-top-3 right-1/4", "top-1/2 -right-3 -translate-y-1/2", "-bottom-3 left-1/4", "-bottom-3 right-1/4", "top-1/2 -left-3 -translate-y-1/2"];
    // Fallback: distribute around a circle (approximated logically)
    const positions = [];
    for(let i=0; i<count; i++) {
        // Just spread them along the edges visually 
        positions.push(`top-[${Math.floor(Math.random()*100)}%] left-[${Math.floor(Math.random()*100)}%]`); 
    }
    return positions;
  };

  const inputClass = "h-10 px-4 rounded-md bg-white border border-[#CBD5E1] text-[13px] text-[#1B2533] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#106292] focus:ring-1 focus:ring-[#106292]/20 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-[#1B2533] uppercase tracking-[0.1em]">Seating & Space Management</h2>
          <p className="text-[11px] font-medium text-[#64748B]">Configure physical zones and assign team workspaces.</p>
        </div>
        
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 h-10 px-4 rounded-md bg-white border border-[#E2E8F0] text-[#475569] text-[13px] font-bold hover:bg-[#F1F5F9] transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Map
          </button>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 h-10 px-4 rounded-md bg-[#106292] text-white text-[13px] font-bold hover:bg-[#0D547D] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Ledger
          </button>
        </div>
      </div>

      {/* Locations Tab List */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 border-b border-[#E2E8F0] no-print">
        {locations.map(loc => (
          <button
            key={loc.id}
            onClick={() => { setActiveLocationId(loc.id); setSelectedTableId(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-md text-[13px] font-bold transition-all border-b-2 ${
              activeLocationId === loc.id 
                ? 'border-[#106292] text-[#106292] bg-[#106292]/5' 
                : 'border-transparent text-[#64748B] hover:text-[#1B2533] hover:bg-[#F8FAFC]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> {loc.name}
            {editable && (
              <div onClick={(e) => { e.stopPropagation(); deleteLocation(loc.id); }} className="ml-1.5 p-1 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors">
                <Trash2 className="w-3 h-3" />
              </div>
            )}
          </button>
        ))}
        {showAddLocation ? (
          <div className="flex items-center gap-2 px-3 pb-1 border-b-2 border-transparent">
            <input 
              autoFocus
              className="h-8 px-3 rounded-md bg-white border border-[#CBD5E1] text-[12px] outline-none focus:border-[#106292]"
              placeholder="Loc name..."
              value={newLocationName}
              onChange={e => setNewLocationName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addLocation()}
            />
            <select 
              value={newLocationLayout} 
              onChange={e => setNewLocationLayout(e.target.value as any)}
              className="h-8 px-2 rounded-md bg-white border border-[#CBD5E1] text-[12px] outline-none focus:border-[#106292]"
            >
              <option value="grid">Grid</option>
              <option value="theater-2-row">Theater (2R)</option>
              <option value="theater-3-row">Theater (3R)</option>
            </select>
            <button onClick={addLocation} className="text-[11px] font-bold text-[#106292] px-2 hover:underline">SAVE</button>
            <button onClick={() => setShowAddLocation(false)} className="text-[11px] font-bold text-[#94A3B8] hover:text-rose-600">X</button>
          </div>
        ) : editable ? (
          <button onClick={() => setShowAddLocation(true)} className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold text-[#106292] hover:bg-[#106292]/5 rounded-t-md transition-colors">
            <Plus className="w-3.5 h-3.5" /> NEW ZONE
          </button>
        ) : null}
      </div>

      {/* Main Grid View */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Left Side: Tables Grid */}
        <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 space-y-8">
          {activeLocation ? (
            <>
              <div className="flex flex-wrap justify-between items-center bg-[#F8FAFC] p-4 rounded-lg border border-[#F1F5F9]">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-md bg-[#106292]/10 flex items-center justify-center">
                    <Grid2X2 className="w-4 h-4 text-[#106292]" />
                  </div>
                  <h3 className="font-bold text-[#1B2533] uppercase text-xs tracking-wider">
                    {activeLocation.name} Zone
                  </h3>
                  <div className="flex gap-2.5 px-3 py-1 bg-white rounded border border-[#E2E8F0] text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-emerald-600">{activeLocationStats.empty} VACANT</span>
                    <span className="text-[#CBD5E1]">|</span>
                    <span className="text-[#106292]">{activeLocationStats.occupied} ASSIGNED</span>
                  </div>
                </div>
                
                {showAddTable ? (
                  <div className="flex items-center gap-2 text-[11px] no-print">
                    <span className="font-bold text-[#64748B]">SEATS:</span>
                    <input type="number" min="1" max="6" className="w-14 h-8 px-2 bg-white border border-[#CBD5E1] rounded outline-none text-center" value={newTableSeats} onChange={e => setNewTableSeats(Number(e.target.value))} />
                    <button onClick={addTable} className="bg-[#106292] text-white font-bold h-8 px-3 rounded-md shadow-sm">ADD</button>
                    <button onClick={() => setShowAddTable(false)} className="text-rose-600 font-bold ml-1">CANCEL</button>
                  </div>
                ) : editable ? (
                  <button onClick={() => setShowAddTable(true)} className="flex items-center gap-1.5 text-[11px] font-bold text-[#106292] hover:bg-[#106292]/5 px-3 py-1.5 rounded-md border border-[#106292]/20 transition-colors no-print">
                    <Plus className="w-3.5 h-3.5" /> ADD TABLE
                  </button>
                ) : null}
              </div>

              {activeLocation.layoutType?.startsWith('theater') && (
                <div className="mt-8 mb-12 mx-auto w-3/4 max-w-lg h-12 bg-[#F1F5F9] border-b-4 border-[#106292]/30 rounded-t-2xl flex items-center justify-center">
                  <span className="text-[#94A3B8] font-bold tracking-[0.6em] text-[11px] uppercase opacity-60">STAGE AREA / AUDITORIUM</span>
                </div>
              )}

              {activeLocation.tables.length > 0 ? (
                <div className={`mt-6 ${
                  activeLocation.layoutType === 'theater-3-row' ? 'grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16' :
                  activeLocation.layoutType === 'theater-2-row' ? 'grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16' :
                  'flex flex-wrap gap-12'
                }`}>
                  {activeLocation.tables.map(table => {
                    const status = getTableStatus(activeLocation.id, table.id);
                    const isSelected = selectedTableId === table.id;
                    const teamAssigned = teams.find(t => t.seatAssigned === getTableAssignKey(activeLocation.id, table.id));
                    
                    const isTheater = activeLocation.layoutType?.startsWith('theater');
                    const positions = isTheater ? [] : getSeatPositions(table.seatCount);

                    return (
                      <div key={table.id} className={`flex flex-col items-center gap-5 relative ${isTheater ? 'w-full' : ''}`}>
                        <div className={`px-3 py-1 rounded-md border text-[9px] font-bold uppercase tracking-widest ${
                          status === 'Occupied' ? 'bg-[#106292]/5 border-[#106292]/20 text-[#106292]' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}>
                          {isTheater ? 'ROW' : 'TABLE'} {table.tableNumber}
                        </div>
                        
                        <button
                          onClick={() => handleTableClick(table)}
                          className={`group/table relative transition-all flex items-center justify-center ${
                            isTheater 
                              ? `w-full h-14 rounded-md border-b-2 flex-row gap-2 px-6 ${
                                  isSelected ? 'border-[#106292] bg-[#106292]/5 scale-[1.02] shadow-md' : 
                                  status === 'Occupied' ? 'border-[#CBD5E1] bg-white hover:border-[#106292]' : 
                                  'border-[#E2E8F0] bg-white hover:border-emerald-500'
                                }`
                              : `w-24 h-24 rounded-lg border flex-col ${
                                  isSelected ? 'ring-2 ring-[#106292] ring-offset-4 border-[#106292] bg-[#106292]/5' : 
                                  status === 'Occupied' ? 'border-[#CBD5E1] bg-white hover:border-[#106292]' : 
                                  'border-[#E2E8F0] bg-white hover:border-emerald-500'
                                }`
                          }`}
                        >
                          {isTheater ? (
                            <>
                              <div className="flex-1 text-left line-clamp-1 text-[12px] font-bold text-[#475569]">
                                {teamAssigned ? <span className="text-[#106292]">{teamAssigned.name}</span> : <span className="text-[#94A3B8] font-medium italic">Unassigned Row</span>}
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                {Array.from({length: table.seatCount}).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-3.5 h-4 rounded-t-sm ${
                                      status === 'Occupied' ? 'bg-[#106292]' : 'bg-emerald-500'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <span className={`${status === 'Occupied' ? 'text-[#106292]' : 'text-[#94A3B8]'} text-[11px] font-bold text-center px-1.5 line-clamp-2 leading-tight`}>
                                {teamAssigned ? teamAssigned.name : 'VACANT'}
                              </span>
                              
                              {Array.from({length: table.seatCount}).map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`absolute w-4 h-4 rounded-sm border transition-all ${
                                    status === 'Occupied' ? 'bg-[#106292] border-white' : 'bg-emerald-500/30 border-emerald-500/20'
                                  } ${positions[idx] || ''}`}
                                />
                              ))}
                            </>
                          )}

                          {editable && (
                            <div 
                              onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }}
                              className="absolute -top-3 -right-3 w-6 h-6 bg-white border border-[#E2E8F0] text-[#CBD5E1] hover:text-rose-600 hover:border-rose-100 rounded-full flex items-center justify-center opacity-0 group-hover/table:opacity-100 transition-all shadow-sm no-print"
                            >
                              <Trash2 className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-[#94A3B8] border-2 border-dashed border-[#F1F5F9] rounded-lg bg-[#F8FAFC]">
                  <Grid2X2 className="w-10 h-10 mb-4 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-tight">Zone Workspace Blank</p>
                  <button onClick={() => setShowAddTable(true)} className="mt-3 text-[#106292] text-[11px] font-bold hover:underline">INITIALIZE TABLES</button>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-[#94A3B8] border-2 border-dashed border-[#F1F5F9] rounded-lg bg-[#F8FAFC]">
              <MapPin className="w-10 h-10 mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-tight">Zone Registry Offline</p>
              <p className="text-[11px] mt-1 font-medium">Please select a designated area to view mapping.</p>
            </div>
          )}
        </div>

        {/* Right Side: Assignment Panel */}
        <div className="w-full xl:w-80 shrink-0 no-print">
          {selectedTable ? (
            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 animate-fade-in sticky top-6">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-md bg-[#106292]/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#106292]" />
                </div>
                <h3 className="font-bold text-[#1B2533] text-sm uppercase tracking-wider">Workspace Ledger</h3>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-md border border-[#F1F5F9]">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Location Identity</div>
                  <div className="font-bold text-[#1B2533]">{activeLocation?.name} — {activeLocation?.layoutType?.startsWith('theater') ? 'Row' : 'Table'} {selectedTable.tableNumber}</div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold">
                    <span className={getTableStatus(activeLocation!.id, selectedTable.id) === 'Occupied' ? 'text-[#106292]' : 'text-emerald-600'}>
                      {getTableStatus(activeLocation!.id, selectedTable.id).toUpperCase()}
                    </span>
                    <span className="text-[#94A3B8]">{selectedTable.seatCount} CAPACITY</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider ml-1">Assigned Collective</label>
                  <select
                    value={selectedTeamId}
                    onChange={e => setSelectedTeamId(e.target.value)}
                    className={`${inputClass} font-medium`}
                  >
                    <option value="">(Vacancy / No Assignment)</option>
                    {teams.map(t => {
                      const isAtThisTable = t.seatAssigned === getTableAssignKey(activeLocation!.id, selectedTable.id);
                      return (
                        <option key={t.id} value={t.id}>
                          {t.name} [{t.members.length} Members] {isAtThisTable ? '«Current»' : t.seatAssigned ? '«Relocated»' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  {editable && (
                    <button
                      onClick={assignTable}
                      disabled={!selectedTeamId}
                      className="w-full h-11 bg-[#106292] text-white text-[13px] font-bold rounded-md hover:bg-[#0D547D] disabled:opacity-40 disabled:grayscale transition-all shadow-sm"
                    >
                      COMMIT ASSIGNMENT
                    </button>
                  )}
                  {editable && getTableStatus(activeLocation!.id, selectedTable.id) === 'Occupied' && (
                    <button
                      onClick={unassignTable}
                      className="w-full h-10 bg-white text-rose-600 text-[12px] font-bold rounded-md hover:bg-rose-50 transition-colors border border-rose-100"
                    >
                      VACATE WORKSPACE
                    </button>
                  )}
                  {!editable && <p className="text-[11px] text-[#94A3B8] font-medium text-center italic">Access restricted to Logistics Personnel.</p>}
                  <button 
                    onClick={() => setSelectedTableId(null)}
                    className="w-full h-10 text-[11px] font-bold text-[#64748B] hover:text-[#1B2533] transition-colors"
                  >
                    DISMISS LEDGER
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-dashed border-[#F1F5F9] p-8 flex flex-col items-center justify-center text-center sticky top-6 h-[400px]">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <Info className="w-6 h-6 text-[#CBD5E1]" />
              </div>
              <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Map Navigation Active</p>
              <p className="text-[11px] text-[#94A3B8] font-medium mt-1">Select a workspace unit on the left to initiate administrative assignment.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SeatingManagementPage;
