import { useState, useMemo } from 'react';
import { useSharedState } from '@/lib/shared-storage';
import { canEdit } from '@/config/team';
import { Search, Printer, Trash2, Plus, Star, FileCode2, CheckCircle2, Clock, Award, ExternalLink } from 'lucide-react';
import { ProjectSubmission, ProjectStatus } from '@/types/hackathon';
import { toast } from 'sonner';

// Mock data generation for initial state if empty
const mockSubmissions: ProjectSubmission[] = [
  {
    id: '1',
    teamId: 't1',
    teamName: 'Cyber Knights',
    projectTitle: 'BlockSecure',
    techStack: ['React', 'Solidity', 'Node.js'],
    submissionTime: '2023-10-25T14:30:00Z',
    githubLink: 'https://github.com/cyber-knights/blocksecure',
    status: 'Judged',
    evaluationScore: 85,
  },
  {
    id: '2',
    teamId: 't2',
    teamName: 'AI Innovators',
    projectTitle: 'Visionary',
    techStack: ['Python', 'TensorFlow', 'React'],
    submissionTime: '2023-10-25T15:45:00Z',
    githubLink: 'https://github.com/ai-innovators/visionary',
    status: 'Under Review',
    evaluationScore: 0,
  },
  {
    id: '3',
    teamId: 't3',
    teamName: 'Web Wizards',
    projectTitle: 'EcoTrack',
    techStack: ['Vue', 'Express', 'MongoDB'],
    submissionTime: '2023-10-25T16:10:00Z',
    githubLink: 'https://github.com/web-wizards/ecotrack',
    status: 'Submitted',
    evaluationScore: 0,
  }
];

const ProjectSubmissionsPage = () => {
  const { state, updateState } = useSharedState();
  const submissions = (state.submissions && state.submissions.length > 0) ? state.submissions : mockSubmissions;
  const currentUser = JSON.parse(localStorage.getItem('protocol24-user') || '{}');
  const editable = canEdit(currentUser.role, 'submissions');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubmission, setNewSubmission] = useState<Partial<ProjectSubmission>>({
    teamName: '',
    projectTitle: '',
    techStack: [],
    githubLink: '',
    status: 'Submitted'
  });
  const [techInput, setTechInput] = useState('');

  const updateStatus = (id: string, newStatus: ProjectStatus) => {
    const proj = submissions.find(s => s.id === id);
    updateState(prev => ({
        ...prev,
        submissions: prev.submissions.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub)
    }), `updated project status: ${proj?.projectTitle} → ${newStatus}`);
    toast.success(`Status updated to ${newStatus}`);
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const matchesSearch = 
        sub.teamName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        sub.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = statusFilter === 'All' || sub.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [submissions, searchTerm, statusFilter]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-500/15 text-blue-500 border-blue-500/20';
      case 'Under Review': return 'bg-amber-500/15 text-amber-500 border-amber-500/20';
      case 'Judged': return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const updateEvaluationScore = (id: string, score: number) => {
    const proj = submissions.find(s => s.id === id);
    updateState(prev => ({
        ...prev,
        submissions: (prev.submissions.length > 0 ? prev.submissions : mockSubmissions).map(s => (s.id === id ? { ...s, evaluationScore: score } : s))
    }), `set evaluation score for ${proj?.projectTitle}: ${score}/100`);
  };

  const deleteSubmission = (id: string, title: string) => {
    if (!window.confirm(`Delete submission "${title}"?`)) return;
    updateState(prev => ({
        ...prev,
        submissions: (prev.submissions.length > 0 ? prev.submissions : mockSubmissions).filter(s => s.id !== id)
    }), `deleted project: ${title}`);
    toast.success('Project submission deleted');
  };

  const addSubmission = () => {
    if (!newSubmission.teamName || !newSubmission.projectTitle) {
      toast.error('Team Name and Project Title are required');
      return;
    }
    
    const submission: ProjectSubmission = {
      id: crypto.randomUUID(),
      teamId: crypto.randomUUID(), // Mock ID
      teamName: newSubmission.teamName,
      projectTitle: newSubmission.projectTitle,
      techStack: newSubmission.techStack || [],
      githubLink: newSubmission.githubLink || '',
      submissionTime: new Date().toISOString(),
      status: newSubmission.status as ProjectStatus,
      evaluationScore: 0
    };

    updateState(prev => ({
        ...prev,
        submissions: [...(prev.submissions.length > 0 ? prev.submissions : mockSubmissions), submission]
    }), `submitted new project: ${submission.projectTitle}`);

    toast.success('Project evaluated/submitted successfully');
    setNewSubmission({ teamName: '', projectTitle: '', techStack: [], githubLink: '', status: 'Submitted' });
    setTechInput('');
    setShowAddForm(false);
  };

  const handleTechInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      setNewSubmission(prev => ({
        ...prev,
        techStack: [...(prev.techStack || []), techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTechItem = (index: number) => {
    setNewSubmission(prev => ({
      ...prev,
      techStack: prev.techStack?.filter((_, i) => i !== index)
    }));
  };

  const stats = useMemo(() => [
    { label: 'Total Submissions', value: submissions.length, icon: FileCode2, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Submitted', value: submissions.filter(s => s.status === 'Submitted').length, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Under Review', value: submissions.filter(s => s.status === 'Under Review').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Judged', value: submissions.filter(s => s.status === 'Judged').length, icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ], [submissions]);

  const inputClass = "h-10 px-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
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

      {/* Main Content */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        {/* Header & Filters */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card/50">
          <h2 className="text-lg font-bold text-foreground">Project Submissions</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search team or project..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9 w-full sm:w-64`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as ProjectStatus | 'All')}
              className={`${inputClass} w-full sm:w-40 appearance-none`}
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Judged">Judged</option>
            </select>
            {editable && (
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Project
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
            <h3 className="text-sm font-bold flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> Evaluate / Submit New Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input placeholder="Team Name" className={inputClass} value={newSubmission.teamName} onChange={e => setNewSubmission({...newSubmission, teamName: e.target.value})} />
              <input placeholder="Project Title" className={inputClass} value={newSubmission.projectTitle} onChange={e => setNewSubmission({...newSubmission, projectTitle: e.target.value})} />
              <input placeholder="GitHub Link" className={inputClass} value={newSubmission.githubLink} onChange={e => setNewSubmission({...newSubmission, githubLink: e.target.value})} />
              <select className={inputClass} value={newSubmission.status} onChange={e => setNewSubmission({...newSubmission, status: e.target.value as ProjectStatus})}>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Judged">Judged</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <input 
                placeholder="Tech Stack (Press Enter to add)" 
                className={`${inputClass} max-w-sm`} 
                value={techInput} 
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={handleTechInputKeyDown}
              />
              {newSubmission.techStack && newSubmission.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {newSubmission.techStack.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
                      {tech} <button onClick={() => removeTechItem(i)}><Trash2 className="w-3 h-3 hover:text-destructive" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={addSubmission} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Save Project</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Team & Project</th>
                <th className="px-6 py-4 font-medium">Tech Stack</th>
                <th className="px-6 py-4 font-medium">GitHub</th>
                <th className="px-6 py-4 font-medium">Time (UTC)</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-center">Eval Score</th>
                <th className="px-6 py-4 font-medium text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{s.projectTitle}</div>
                      <div className="text-xs text-muted-foreground">{s.teamName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {s.techStack.map(tech => (
                          <span key={tech} className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground border border-border">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={s.githubLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> View Repo
                      </a>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(s.submissionTime).toLocaleDateString()}
                      <br />
                      {new Date(s.submissionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editable ? (
                        <select
                          value={s.status}
                          onChange={(e) => updateStatus(s.id, e.target.value as ProjectStatus)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border appearance-none font-medium outline-none cursor-pointer text-center no-print ${
                            s.status === 'Judged'
                              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
                              : s.status === 'Under Review'
                              ? 'bg-amber-500/15 text-amber-500 border-amber-500/20'
                              : 'bg-blue-500/15 text-blue-500 border-blue-500/20'
                          }`}
                        >
                          <option value="Submitted" className="bg-background text-foreground">Submitted</option>
                          <option value="Under Review" className="bg-background text-foreground">Under Review</option>
                          <option value="Judged" className="bg-background text-foreground">Judged</option>
                        </select>
                      ) : (
                        <span className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium ${
                            s.status === 'Judged' ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' : 
                            s.status === 'Under Review' ? 'bg-amber-500/15 text-amber-500 border-amber-500/20' : 
                            'bg-blue-500/15 text-blue-500 border-blue-500/20'
                        }`}>
                            {s.status}
                        </span>
                      )}
                      <span className={`hidden print:inline font-bold ${
                        s.status === 'Judged' ? 'text-emerald-600' : s.status === 'Under Review' ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editable ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={s.evaluationScore || ''}
                          onChange={(e) => updateEvaluationScore(s.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 text-center bg-muted/50 border border-border rounded-lg text-sm font-semibold outline-none focus:border-primary no-print"
                          placeholder="--"
                        />
                      ) : (
                        <span className="text-sm font-bold">{s.evaluationScore || '--'}</span>
                      )}
                      <span className="hidden print:inline font-bold">
                        {s.evaluationScore ? `${s.evaluationScore}/100` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right no-print">
                      {editable && (
                        <button
                          onClick={() => deleteSubmission(s.id, s.projectTitle)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <FileCode2 className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No project submissions found</p>
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

export default ProjectSubmissionsPage;
