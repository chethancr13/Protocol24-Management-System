import { useState, useMemo } from 'react';
import { useSharedState } from '@/lib/shared-storage';
import { canEdit } from '@/config/team';
import { Search, Printer, Trash2, Plus, Star, FileCode2, CheckCircle2, Clock, Award, ExternalLink, X } from 'lucide-react';
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

  const inputClass = "h-10 px-4 rounded-md bg-white border border-[#CBD5E1] text-[13px] text-[#1B2533] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#106292] focus:ring-1 focus:ring-[#106292]/20 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
        {stats.map(stat => (
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

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Header & Filters */}
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white no-print">
          <h2 className="text-sm font-bold text-[#1B2533] uppercase tracking-[0.1em]">Project Submissions</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9 w-full sm:w-56`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as ProjectStatus | 'All')}
              className={`${inputClass} w-full sm:w-40 appearance-none font-medium`}
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Judged">Judged</option>
            </select>
            {editable && (
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center justify-center gap-2 h-10 px-5 rounded-md bg-[#106292] text-white text-[13px] font-bold hover:bg-[#0D547D] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Project
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
               New Project Evaluation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Team Name</label>
                <input placeholder="Team Identifier" className={inputClass} value={newSubmission.teamName} onChange={e => setNewSubmission({...newSubmission, teamName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Project Title</label>
                <input placeholder="App Name" className={inputClass} value={newSubmission.projectTitle} onChange={e => setNewSubmission({...newSubmission, projectTitle: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Code Repository</label>
                <input placeholder="github.com/..." className={inputClass} value={newSubmission.githubLink} onChange={e => setNewSubmission({...newSubmission, githubLink: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Status</label>
                <select className={`${inputClass} font-medium`} value={newSubmission.status} onChange={e => setNewSubmission({...newSubmission, status: e.target.value as ProjectStatus})}>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Judged">Judged</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1">Technology Stack</label>
              <input 
                placeholder="Type and press Enter (e.g. React, Docker)" 
                className={`${inputClass} max-w-sm`} 
                value={techInput} 
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={handleTechInputKeyDown}
              />
              {newSubmission.techStack && newSubmission.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {newSubmission.techStack.map((tech, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#106292]/5 text-[#106292] text-[11px] font-bold uppercase rounded-md border border-[#106292]/10 flex items-center gap-2">
                      {tech} <button onClick={() => removeTechItem(i)} className="hover:text-rose-600 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowAddForm(false)} className="px-5 py-2 text-[13px] font-bold text-[#64748B] hover:text-[#1B2533]">Cancel</button>
              <button onClick={addSubmission} className="px-6 py-2 rounded-md bg-[#106292] text-white text-[13px] font-bold hover:bg-[#0D547D] shadow-sm">Initialize Evaluation</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] uppercase tracking-[0.1em] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4">Project & Team</th>
                <th className="px-6 py-4">Stack</th>
                <th className="px-6 py-4">Repository</th>
                <th className="px-6 py-4">Submission</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#1B2533] text-[14px]">{s.projectTitle}</div>
                      <div className="text-[11px] font-bold text-[#64748B] uppercase mt-0.5 tracking-tight">{s.teamName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {s.techStack.map(tech => (
                          <span key={tech} className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-[#475569] border border-slate-100 uppercase">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={s.githubLink} target="_blank" rel="noopener noreferrer" className="text-[#106292] hover:underline text-[12px] font-semibold flex items-center gap-1.5 transition-all">
                        <ExternalLink className="w-3.5 h-3.5" /> Source
                      </a>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-[#64748B] font-medium whitespace-nowrap">
                      {new Date(s.submissionTime).toLocaleDateString()}
                      <div className="text-[10px] text-[#94A3B8] font-bold mt-0.5">
                         {new Date(s.submissionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editable ? (
                        <select
                          value={s.status}
                          onChange={(e) => updateStatus(s.id, e.target.value as ProjectStatus)}
                          className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border appearance-none outline-none cursor-pointer text-center no-print transition-colors ${
                             s.status === 'Judged' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                             s.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                             'bg-[#F8FAFC] text-[#106292] border-[#E2E8F0]'
                          }`}
                        >
                          <option value="Submitted" className="bg-white text-[#1B2533]">Submitted</option>
                          <option value="Under Review" className="bg-white text-[#1B2533]">Under Review</option>
                          <option value="Judged" className="bg-white text-[#1B2533]">Judged</option>
                        </select>
                      ) : (
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border ${
                             s.status === 'Judged' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                             s.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                             'bg-[#F8FAFC] text-[#106292] border-[#E2E8F0]'
                        }`}>
                            {s.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editable ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={s.evaluationScore || ''}
                          onChange={(e) => updateEvaluationScore(s.id, Number(e.target.value))}
                          className="w-16 px-2 py-1.5 text-center bg-slate-50 border border-[#E2E8F0] rounded-md text-[13px] font-bold text-[#1B2533] outline-none focus:border-[#106292] no-print"
                          placeholder="--"
                        />
                      ) : (
                        <span className="text-[13px] font-bold text-[#1B2533]">{s.evaluationScore || '--'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right no-print">
                      {editable && (
                        <button
                          onClick={() => deleteSubmission(s.id, s.projectTitle)}
                          className="p-1.5 rounded-md text-[#CBD5E1] hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
                  <td colSpan={7} className="px-6 py-20 text-center text-[#94A3B8]">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileCode2 className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-sm font-medium">No project submissions record found</p>
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
