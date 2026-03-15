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

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Advanced Seating Map</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Group tables by physical locations and lock team assignments to scalable tables.
          </p>
        </div>
        
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-accent/20 no-print"
          >
            <Printer className="w-4 h-4" /> Print Map
          </button>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20 no-print"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Locations Tab List */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border no-print">
        {locations.map(loc => (
          <button
            key={loc.id}
            onClick={() => { setActiveLocationId(loc.id); setSelectedTableId(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-bold transition-all border-b-2 ${
              activeLocationId === loc.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <MapPin className="w-4 h-4" /> {loc.name}
            {editable && (
              <div onClick={(e) => { e.stopPropagation(); deleteLocation(loc.id); }} className="ml-1 p-1 hover:bg-destructive/20 hover:text-destructive rounded-md transition-colors">
                <Trash2 className="w-3 h-3" />
              </div>
            )}
          </button>
        ))}
        {showAddLocation ? (
          <div className="flex items-center gap-2 px-2">
            <input 
              autoFocus
              className="h-8 px-3 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary"
              placeholder="e.g. Lab 2"
              value={newLocationName}
              onChange={e => setNewLocationName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addLocation()}
            />
            <select 
              value={newLocationLayout} 
              onChange={e => setNewLocationLayout(e.target.value as any)}
              className="h-8 px-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary"
            >
              <option value="grid">Grid</option>
              <option value="theater-2-row">Theater (2 Rows)</option>
              <option value="theater-3-row">Theater (3 Rows)</option>
            </select>
            <button onClick={addLocation} className="text-sm font-bold text-primary">Save</button>
            <button onClick={() => setShowAddLocation(false)} className="text-sm text-muted-foreground">Cancel</button>
          </div>
        ) : editable ? (
          <button onClick={() => setShowAddLocation(true)} className="flex items-center gap-1 px-4 py-2 rounded-t-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30">
            <Plus className="w-4 h-4" /> New Location
          </button>
        ) : null}
      </div>

      {/* Main Grid View */}
      <div className="glass-card flex flex-col xl:flex-row gap-6 p-6 rounded-2xl border border-border">
        
        {/* Left Side: Tables Grid */}
        <div className="flex-1 space-y-8">
          {activeLocation ? (
            <>
              <div className="flex flex-wrap justify-between items-center bg-muted/30 p-3 rounded-xl border border-border">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Grid2X2 className="w-5 h-5 text-primary" /> {activeLocation.name} 
                  </h3>
                  <div className="flex gap-2 px-3 py-1 bg-background rounded-lg text-xs font-medium border border-border">
                    <span className="text-success">{activeLocationStats.empty} Empty</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-primary">{activeLocationStats.occupied} Occupied</span>
                  </div>
                </div>
                
                {showAddTable ? (
                  <div className="flex items-center gap-2 text-xs no-print">
                    Seats:
                    <input type="number" min="1" max="6" className="w-16 h-8 px-2 bg-background border border-border rounded outline-none" value={newTableSeats} onChange={e => setNewTableSeats(Number(e.target.value))} />
                    <button onClick={addTable} className="text-primary font-bold px-2">Add</button>
                    <button onClick={() => setShowAddTable(false)} className="text-muted-foreground">Cancel</button>
                  </div>
                ) : editable ? (
                  <button onClick={() => setShowAddTable(true)} className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 no-print">
                    <Plus className="w-3 h-3" /> Add Table
                  </button>
                ) : null}
              </div>

              {activeLocation.layoutType?.startsWith('theater') && (
                <div className="mt-8 mb-10 mx-auto w-3/4 max-w-lg h-16 bg-muted border-b-8 border-primary/20 rounded-t-3xl flex items-center justify-center shadow-lg shadow-black/5">
                  <span className="text-muted-foreground font-black tracking-[0.5em] text-lg uppercase opacity-50">STAGE</span>
                </div>
              )}

              {activeLocation.tables.length > 0 ? (
                <div className={`mt-6 ${
                  activeLocation.layoutType === 'theater-3-row' ? 'grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 place-items-center' :
                  activeLocation.layoutType === 'theater-2-row' ? 'grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 place-items-center' :
                  'flex flex-wrap gap-8 justify-center sm:justify-start'
                }`}>
                  {activeLocation.tables.map(table => {
                    const status = getTableStatus(activeLocation.id, table.id);
                    const isSelected = selectedTableId === table.id;
                    const teamAssigned = teams.find(t => t.seatAssigned === getTableAssignKey(activeLocation.id, table.id));
                    
                    const isTheater = activeLocation.layoutType?.startsWith('theater');
                    const positions = isTheater ? [] : getSeatPositions(table.seatCount);

                    return (
                      <div key={table.id} className={`flex flex-col items-center gap-4 relative ${isTheater ? 'w-full max-w-[280px]' : ''}`}>
                        {/* Status Label */}
                        <div className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                          status === 'Occupied' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-success/10 border-success/20 text-success'
                        }`}>
                          {isTheater ? 'Row' : 'Table'} {table.tableNumber}
                        </div>
                        
                        {/* Table/Row Representation */}
                        <button
                          onClick={() => handleTableClick(table)}
                          className={`relative transition-all flex items-center justify-center ${
                            isTheater 
                              ? `w-full h-16 rounded-xl border-b-4 flex-row gap-1 px-4 ${
                                  isSelected ? 'border-primary bg-primary/10 scale-105' : 
                                  status === 'Occupied' ? 'border-primary/50 bg-primary/5 hover:bg-primary/10' : 
                                  'border-success/50 bg-card hover:border-success'
                                }`
                              : `w-28 h-28 rounded-2xl border-2 flex-col ${
                                  isSelected ? 'ring-4 ring-primary ring-offset-4 ring-offset-background border-primary bg-primary/5' : 
                                  status === 'Occupied' ? 'border-primary/50 bg-primary/10 hover:border-primary' : 
                                  'border-border bg-card hover:border-success/50'
                                }`
                          }`}
                        >
                          {/* Inner Table Info */}
                          {isTheater ? (
                            <>
                              <div className="flex-1 text-left line-clamp-1 text-xs font-bold text-muted-foreground mr-2">
                                {teamAssigned ? <span className="text-primary">{teamAssigned.name}</span> : 'Open Row'}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                {Array.from({length: table.seatCount}).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-3 h-4 rounded-t-md opacity-80 ${
                                      status === 'Occupied' ? 'bg-primary' : 'bg-success'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <span className={`${status === 'Occupied' ? 'text-primary' : 'text-muted-foreground'} text-xs font-bold text-center px-2 line-clamp-2`}>
                                {teamAssigned ? teamAssigned.name : 'Open Table'}
                              </span>
                              
                              {/* Seats around the table */}
                              {Array.from({length: table.seatCount}).map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`absolute w-5 h-5 rounded-full border-2 transition-all ${
                                    status === 'Occupied' ? 'bg-primary border-background' : 'bg-success/50 border-background'
                                  } ${positions[idx] || ''}`}
                                />
                              ))}
                            </>
                          )}
                        </button>
                        
                        {/* Delete Button (visible on hover or always in small form) */}
                        {editable && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity drop-shadow-md no-print"
                            style={{ opacity: isSelected ? 1 : undefined }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  <Grid2X2 className="w-10 h-10 mb-4 opacity-20" />
                  <p>No tables configured for {activeLocation.name}.</p>
                  <button onClick={() => setShowAddTable(true)} className="mt-2 text-primary text-sm font-semibold hover:underline">Create the first table</button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <MapPin className="w-10 h-10 mb-4 opacity-20" />
              <p>Please select or create a physical location group first.</p>
            </div>
          )}
        </div>

        {/* Right Side: Assignment Panel */}
        <div className="w-full xl:w-80 shrink-0 h-fit sticky top-6 no-print">
          {selectedTable ? (
            <div className="bg-card rounded-xl border border-border p-5 animate-fade-in shadow-xl shadow-black/5">
              <h3 className="font-bold text-lg text-foreground mb-4">Table Assignment</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Target</p>
                  <div className="font-semibold text-lg">{activeLocation?.name} - Table {selectedTable.tableNumber}</div>
                  <div className="mt-2 text-xs flex items-center justify-between">
                    <span>Status: <strong className={getTableStatus(activeLocation!.id, selectedTable.id) === 'Occupied' ? 'text-primary' : 'text-success'}>
                      {getTableStatus(activeLocation!.id, selectedTable.id)}
                    </strong></span>
                    <span className="text-muted-foreground">{selectedTable.seatCount} Seats</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Lock to Team</label>
                  <select
                    value={selectedTeamId}
                    onChange={e => setSelectedTeamId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">-- Unassigned / Select Team --</option>
                    {teams.map(t => {
                      const isAtThisTable = t.seatAssigned === getTableAssignKey(activeLocation!.id, selectedTable.id);
                      return (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.members.length} members) {isAtThisTable ? '[Active]' : t.seatAssigned ? '[Moved]' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="pt-4 flex gap-2">
                  {editable && (
                    <button
                      onClick={assignTable}
                      disabled={!selectedTeamId}
                      className="flex-1 h-10 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Lock Team
                    </button>
                  )}
                  {editable && getTableStatus(activeLocation!.id, selectedTable.id) === 'Occupied' && (
                    <button
                      onClick={unassignTable}
                      className="flex-1 h-10 bg-destructive/10 text-destructive text-sm font-medium rounded-lg hover:bg-destructive/20 transition-all border border-destructive/20"
                    >
                      Clear
                    </button>
                  )}
                  {!editable && <p className="text-xs text-muted-foreground text-center w-full">Ask a Logistics Lead to modify seating.</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center h-[300px]">
              <Info className="w-10 h-10 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground font-medium">Select a structural table on the map to modify its team assignment.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SeatingManagementPage;
