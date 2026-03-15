import { useState } from 'react';
import { useSharedState } from '@/lib/shared-storage';
import { canEdit } from '@/config/team';
import { Search, Printer, Plus, Trash2, Wallet, CreditCard, Banknote } from 'lucide-react';
import { Expense, ExpenseStatus } from '@/types/hackathon';
import { toast } from 'sonner';

const ExpensesPage = () => {
  const { state, updateState } = useSharedState();
  const expenses = state.expenses || [];
  const currentUser = JSON.parse(localStorage.getItem('protocol24-user') || '{}');
  const editable = canEdit(currentUser.role, 'expenses');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'All'>('All');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    category: '',
    amount: 0,
    status: 'Pending'
  });

  const categories = ['Venue', 'Food & Beverages', 'Prizes', 'Marketing', 'Swag', 'Software', 'Other'];

  const filtered = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addExpense = () => {
    if (!newExpense.description || !newExpense.category || !newExpense.amount) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const expense: Expense = {
      id: crypto.randomUUID(),
      description: newExpense.description,
      category: newExpense.category,
      amount: Number(newExpense.amount),
      date: new Date().toISOString(),
      status: newExpense.status as ExpenseStatus,
    };

    updateState(prev => ({
        ...prev,
        expenses: [...prev.expenses, expense]
    }), `added expense: ${expense.description} (₹${expense.amount})`);
    
    toast.success('Expense added successfully');
    setNewExpense({ description: '', category: '', amount: 0, status: 'Pending' });
    setShowAddForm(false);
  };

  const deleteExpense = (id: string, name: string) => {
    if (!window.confirm(`Delete expense "${name}"?`)) return;
    updateState(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== id)
    }), `deleted expense: ${name}`);
    toast.success('Expense deleted');
  };

  const updateStatus = (id: string, status: ExpenseStatus) => {
    updateState(prev => ({
        ...prev,
        expenses: prev.expenses.map(e => e.id === id ? { ...e, status } : e)
    }), `updated expense status to ${status} for "${expenses.find(e => e.id === id)?.description}"`);
    toast.success('Status updated');
  };

  const stats = {
    totalSpent: expenses.filter(e => e.status !== 'Cancelled').reduce((sum, e) => sum + e.amount, 0),
    paid: expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0),
    pending: expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0),
  };

  const inputClass = "h-10 px-4 rounded-md bg-white border border-[#CBD5E1] text-[13px] text-[#1B2533] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#106292] focus:ring-1 focus:ring-[#106292]/20 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {[
          { label: 'Total Budget Used', value: `₹${stats.totalSpent.toLocaleString()}`, icon: Wallet, color: 'text-[#106292]', bg: 'bg-[#106292]/10' },
          { label: 'Total Paid out', value: `₹${stats.paid.toLocaleString()}`, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Invoice/Payment', value: `₹${stats.pending.toLocaleString()}`, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' }
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
          <h2 className="text-sm font-bold text-[#1B2533] uppercase tracking-[0.1em]">Hackathon Expenses</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search description..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9 w-full sm:w-56`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as ExpenseStatus | 'All')}
              className={`${inputClass} w-full sm:w-40 appearance-none font-medium`}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {editable && (
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center justify-center gap-2 h-10 px-5 rounded-md bg-[#106292] text-white text-[13px] font-bold hover:bg-[#0D547D] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Expense
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
               New Expense Entry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Item Description</label>
                <input placeholder="What are we paying for?" className={`${inputClass} w-full`} value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Category</label>
                <select className={`${inputClass} w-full font-medium`} value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Amount (₹)</label>
                <input type="number" placeholder="0" className={`${inputClass} w-full font-bold`} value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Initial Status</label>
                <select className={`${inputClass} w-full font-medium`} value={newExpense.status} onChange={e => setNewExpense({...newExpense, status: e.target.value as ExpenseStatus})}>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowAddForm(false)} className="px-5 py-2 text-[13px] font-bold text-[#64748B] hover:text-[#1B2533]">Cancel</button>
              <button onClick={addExpense} className="px-6 py-2 rounded-md bg-[#106292] text-white text-[13px] font-bold hover:bg-[#0D547D] shadow-sm">Record Expense</button>
            </div>
          </div>
        )}

        {/* Print Only Header */}
        <div className="hidden print:block p-8 border-b border-[#E2E8F0]">
          <h2 className="text-2xl font-bold text-[#1B2533]">Hackathon Expenses Report</h2>
          <p className="text-sm text-[#64748B] mt-1">Generated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] uppercase tracking-[0.1em] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white">
              {filtered.length > 0 ? (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="px-6 py-4">
                       <span className="text-[13px] font-semibold text-[#1B2533]">{exp.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[11px] font-bold text-[#475569] uppercase tracking-tight">{exp.category}</span>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-[13px] font-bold text-[#106292] bg-[#106292]/5 px-2 py-1 rounded-md">₹{exp.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] font-medium text-[#64748B]">{new Date(exp.date).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editable ? (
                        <select
                          value={exp.status}
                          onChange={e => updateStatus(exp.id, e.target.value as ExpenseStatus)}
                          className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border appearance-none outline-none cursor-pointer text-center no-print transition-colors ${
                            exp.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            exp.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}
                        >
                          <option value="Pending" className="bg-white text-[#1B2533]">Pending</option>
                          <option value="Paid" className="bg-white text-[#1B2533]">Paid</option>
                          <option value="Cancelled" className="bg-white text-[#1B2533]">Cancelled</option>
                        </select>
                      ) : (
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border ${
                            exp.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            exp.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                            'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                            {exp.status}
                        </span>
                      )}
                      <span className={`hidden print:inline font-bold ${
                        exp.status === 'Paid' ? 'text-green-700' : 
                        exp.status === 'Cancelled' ? 'text-rose-700' : 'text-amber-700'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right no-print">
                      {editable && (
                        <button
                          onClick={() => deleteExpense(exp.id, exp.description)}
                          className="p-1.5 rounded-md text-[#CBD5E1] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Expense"
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
                        <Wallet className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-sm font-medium">No expenses recorded yet</p>
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

export default ExpensesPage;
