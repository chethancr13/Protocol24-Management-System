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

  const inputClass = "h-10 px-4 rounded-md bg-white border border-[#CBD5E1] text-[13px] text-[#1B2533] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#106292] focus:ring-1 focus:ring-[#106292]/20 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {[
          { label: 'Total Tracked Items', value: items.reduce((sum, e) => sum + e.quantity, 0), icon: Package, color: 'text-[#106292]', bg: 'bg-[#106292]/10' },
          { label: 'Pending Delivery', value: items.filter(e => ['Ordered', 'In Transit'].includes(e.status)).reduce((sum, e) => sum + e.quantity, 0), icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Venue (Delivered)', value: items.filter(e => ['Delivered', 'Distributed'].includes(e.status)).reduce((sum, e) => sum + e.quantity, 0), icon: Box, color: 'text-emerald-600', bg: 'bg-emerald-50' }
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
        {/* Header & Controls */}
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white no-print">
          <h2 className="text-sm font-bold text-[#1B2533] uppercase tracking-[0.1em]">Goods & Logistics Tracking</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9 w-full sm:w-56`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as LogisticsStatus | 'All')}
              className={`${inputClass} w-full sm:w-40 appearance-none font-medium`}
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
                className="flex items-center justify-center gap-2 h-10 px-5 rounded-md bg-[#106292] text-white text-[13px] font-bold hover:bg-[#0D547D] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            )}
            <button 
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-white border border-[#E2E8F0] text-[#475569] text-[13px] font-bold hover:bg-[#F1F5F9] transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="p-6 bg-slate-50 border-b border-[#E2E8F0] flex flex-col gap-5 animate-fade-in no-print ring-1 ring-inset ring-[#E2E8F0]">
            <h3 className="text-xs font-bold text-[#1B2533] uppercase tracking-wider flex items-center gap-2">
               <div className="w-1.5 h-3 bg-[#106292] rounded-full" />
               New Logistics Entry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Item Name</label>
                <input placeholder="What are we tracking?" className={`${inputClass} w-full`} value={newItem.itemName} onChange={e => setNewItem({...newItem, itemName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Category</label>
                <select className={`${inputClass} w-full font-medium`} value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Quantity</label>
                <input type="number" placeholder="0" className={`${inputClass} w-full font-bold`} value={newItem.quantity || ''} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Location</label>
                <input placeholder="Storage Area" className={`${inputClass} w-full`} value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Current Status</label>
                <select className={`${inputClass} w-full font-medium`} value={newItem.status} onChange={e => setNewItem({...newItem, status: e.target.value as LogisticsStatus})}>
                  <option value="Ordered">Ordered</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Distributed">Distributed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowAddForm(false)} className="px-5 py-2 text-[13px] font-bold text-[#64748B] hover:text-[#1B2533]">Cancel</button>
              <button onClick={addItem} className="px-6 py-2 rounded-md bg-[#106292] text-white text-[13px] font-bold hover:bg-[#0D547D] shadow-sm">Save Item</button>
            </div>
          </div>
        )}

        {/* Print Only Header */}
        <div className="hidden print:block p-8 border-b border-[#E2E8F0]">
          <h2 className="text-2xl font-bold text-[#1B2533]">Hackathon Logistics Report</h2>
          <p className="text-sm text-[#64748B] mt-1">Status Report: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] uppercase tracking-[0.1em] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Storage Location</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="px-6 py-4">
                       <span className="text-[13px] font-semibold text-[#1B2533]">{item.itemName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[11px] font-bold text-[#475569] uppercase tracking-tight">{item.category}</span>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-[13px] font-bold text-[#106292] bg-[#106292]/5 px-2 py-1 rounded-md">{item.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] font-medium text-[#64748B] italic">{item.location}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editable ? (
                        <select
                          value={item.status}
                          onChange={e => updateStatus(item.id, e.target.value as LogisticsStatus)}
                          className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border appearance-none outline-none cursor-pointer text-center no-print transition-colors ${
                            ['Delivered', 'Distributed'].includes(item.status) ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}
                        >
                          <option value="Ordered" className="bg-white text-[#1B2533]">Ordered</option>
                          <option value="In Transit" className="bg-white text-[#1B2533]">In Transit</option>
                          <option value="Delivered" className="bg-white text-[#1B2533]">Delivered</option>
                          <option value="Distributed" className="bg-white text-[#1B2533]">Distributed</option>
                        </select>
                      ) : (
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border ${
                            ['Delivered', 'Distributed'].includes(item.status) ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                            {item.status}
                        </span>
                      )}
                      <span className={`hidden print:inline font-bold ${
                        ['Delivered', 'Distributed'].includes(item.status) ? 'text-green-700' : 'text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right no-print">
                      {editable && (
                        <button
                          onClick={() => deleteItem(item.id, item.itemName)}
                          className="p-1.5 rounded-md text-[#CBD5E1] hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
                  <td colSpan={6} className="px-6 py-20 text-center text-[#94A3B8]">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-sm font-medium">No logistics items tracked yet</p>
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
