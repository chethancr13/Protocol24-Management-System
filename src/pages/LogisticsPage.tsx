import { useState } from 'react';
import { useSharedState } from '@/lib/shared-storage';
import { canEdit } from '@/config/team';
import { Search, Printer, Plus, Trash2, Package, Truck, Box } from 'lucide-react';
import { LogisticsItem, LogisticsStatus } from '@/types/hackathon';
import { toast } from 'sonner';

const LogisticsPage = () => {
  const { state, updateState } = useSharedState();
  const items = state.logistics || [];
  const currentUser = JSON.parse(localStorage.getItem('protocol24-user') || '{}');
  const editable = canEdit(currentUser.role, 'logistics');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LogisticsStatus | 'All'>('All');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<LogisticsItem>>({
    itemName: '',
    category: '',
    quantity: 1,
    location: '',
    status: 'Ordered'
  });

  const categories = ['Swag', 'Hardware', 'Hardware (Rentals)', 'Decorations', 'Stationery', 'Other'];

  const filtered = items.filter(e => {
    const matchesSearch = e.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || e.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addItem = () => {
    if (!newItem.itemName || !newItem.category || !newItem.quantity || !newItem.location) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const logisticsItem: LogisticsItem = {
      id: crypto.randomUUID(),
      itemName: newItem.itemName,
      category: newItem.category,
      quantity: Number(newItem.quantity),
      location: newItem.location,
      status: newItem.status as LogisticsStatus,
    };

    updateState(prev => ({
        ...prev,
        logistics: [...prev.logistics, logisticsItem]
    }), `added logistics item: ${logisticsItem.itemName} (Qty: ${logisticsItem.quantity})`);

    toast.success('Item added successfully');
    setNewItem({ itemName: '', category: '', quantity: 1, location: '', status: 'Ordered' });
    setShowAddForm(false);
  };

  const deleteItem = (id: string, name: string) => {
    if (!window.confirm(`Delete item "${name}"?`)) return;
    updateState(prev => ({
        ...prev,
        logistics: prev.logistics.filter(e => e.id !== id)
    }), `deleted logistics item: ${name}`);
    toast.success('Item deleted');
  };

  const updateStatus = (id: string, status: LogisticsStatus) => {
    const item = items.find(i => i.id === id);
    updateState(prev => ({
        ...prev,
        logistics: prev.logistics.map(e => e.id === id ? { ...e, status } : e)
    }), `updated status of "${item?.itemName}" to ${status} in ${item?.location}`);
    toast.success('Status updated');
  };

  const inputClass = "h-10 px-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {[
          { label: 'Total Tracked Items', value: items.reduce((sum, e) => sum + e.quantity, 0), icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Pending Delivery', value: items.filter(e => ['Ordered', 'In Transit'].includes(e.status)).reduce((sum, e) => sum + e.quantity, 0), icon: Truck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'In Venue (Delivered)', value: items.filter(e => ['Delivered', 'Distributed'].includes(e.status)).reduce((sum, e) => sum + e.quantity, 0), icon: Box, color: 'text-success', bg: 'bg-success/10' }
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
        {/* Header & Controls */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card/50 no-print">
          <h2 className="text-lg font-bold text-foreground">Goods & Logistics Tracking</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search items or location..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9 w-full sm:w-64`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as LogisticsStatus | 'All')}
              className={`${inputClass} w-full sm:w-40 appearance-none`}
            >
              <option value="All">All Statuses</option>
              <option value="Ordered">Ordered</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Distributed">Distributed</option>
            </select>

            {editable && (
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            )}
            <button 
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-all"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="p-6 bg-muted/10 border-b border-border flex flex-col gap-4 animate-fade-in no-print">
            <h3 className="text-sm font-bold">New Logistics Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <input placeholder="Item Name" className={`${inputClass} lg:col-span-2`} value={newItem.itemName} onChange={e => setNewItem({...newItem, itemName: e.target.value})} />
              <select className={inputClass} value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                <option value="">Category...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Qty" className={inputClass} value={newItem.quantity || ''} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} />
              <input placeholder="Storage Location" className={inputClass} value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} />
              <select className={inputClass} value={newItem.status} onChange={e => setNewItem({...newItem, status: e.target.value as LogisticsStatus})}>
                <option value="Ordered">Ordered</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Distributed">Distributed</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={addItem} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Track Item</button>
            </div>
          </div>
        )}

        {/* Print Only Header */}
        <div className="hidden print:block p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Hackathon Logistics Report</h2>
          <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Item Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{item.itemName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-muted rounded-md text-xs">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-foreground">{item.quantity}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editable ? (
                        <select
                          value={item.status}
                          onChange={e => updateStatus(item.id, e.target.value as LogisticsStatus)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border appearance-none font-medium outline-none cursor-pointer text-center no-print ${
                            ['Delivered', 'Distributed'].includes(item.status) ? 'bg-success/15 text-success border-success/20' : 
                            'bg-amber-500/15 text-amber-500 border-amber-500/20'
                          }`}
                        >
                          <option value="Ordered" className="bg-background text-foreground">Ordered</option>
                          <option value="In Transit" className="bg-background text-foreground">In Transit</option>
                          <option value="Delivered" className="bg-background text-foreground">Delivered</option>
                          <option value="Distributed" className="bg-background text-foreground">Distributed</option>
                        </select>
                      ) : (
                        <span className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium ${
                            ['Delivered', 'Distributed'].includes(item.status) ? 'bg-success/15 text-success border-success/20' : 
                            'bg-amber-500/15 text-amber-500 border-amber-500/20'
                        }`}>
                            {item.status}
                        </span>
                      )}
                      <span className={`hidden print:inline font-bold ${
                        ['Delivered', 'Distributed'].includes(item.status) ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right no-print">
                      {editable && (
                        <button
                          onClick={() => deleteItem(item.id, item.itemName)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No logistics items tracked yet</p>
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

export default LogisticsPage;
