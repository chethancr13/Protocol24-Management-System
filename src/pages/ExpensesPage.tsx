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

  const inputClass = "h-10 px-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {[
          { label: 'Total Budget Used', value: `₹${stats.totalSpent.toLocaleString()}`, icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total Paid out', value: `₹${stats.paid.toLocaleString()}`, icon: Banknote, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pending Invoice/Payment', value: `₹${stats.pending.toLocaleString()}`, icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10' }
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
          <h2 className="text-lg font-bold text-foreground">Hackathon Expenses</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9 w-full sm:w-64`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as ExpenseStatus | 'All')}
              className={`${inputClass} w-full sm:w-40 appearance-none`}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {editable && (
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Expense
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
            <h3 className="text-sm font-bold">New Expense Record</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <input placeholder="Description" className={`${inputClass} lg:col-span-2`} value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
              <select className={inputClass} value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Amount (₹)" className={inputClass} value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} />
              <select className={inputClass} value={newExpense.status} onChange={e => setNewExpense({...newExpense, status: e.target.value as ExpenseStatus})}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={addExpense} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Save Expense</button>
            </div>
          </div>
        )}

        {/* Print Only Header */}
        <div className="hidden print:block p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Hackathon Expenses Report</h2>
          <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date added</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{exp.description}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-muted rounded-md text-xs">{exp.category}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">₹{exp.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editable ? (
                        <select
                          value={exp.status}
                          onChange={e => updateStatus(exp.id, e.target.value as ExpenseStatus)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border appearance-none font-medium outline-none cursor-pointer text-center no-print ${
                            exp.status === 'Paid' ? 'bg-success/15 text-success border-success/20' : 
                            exp.status === 'Cancelled' ? 'bg-destructive/15 text-destructive border-destructive/20' : 
                            'bg-amber-500/15 text-amber-500 border-amber-500/20'
                          }`}
                        >
                          <option value="Pending" className="bg-background text-foreground">Pending</option>
                          <option value="Paid" className="bg-background text-foreground">Paid</option>
                          <option value="Cancelled" className="bg-background text-foreground">Cancelled</option>
                        </select>
                      ) : (
                        <span className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium ${
                            exp.status === 'Paid' ? 'bg-success/15 text-success border-success/20' : 
                            exp.status === 'Cancelled' ? 'bg-destructive/15 text-destructive border-destructive/20' : 
                            'bg-amber-500/15 text-amber-500 border-amber-500/20'
                        }`}>
                            {exp.status}
                        </span>
                      )}
                      <span className={`hidden print:inline font-bold ${
                        exp.status === 'Paid' ? 'text-green-600' : 
                        exp.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right no-print">
                      {editable && (
                        <button
                          onClick={() => deleteExpense(exp.id, exp.description)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Wallet className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No expenses recorded</p>
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
