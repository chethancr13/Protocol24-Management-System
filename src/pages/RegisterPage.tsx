import { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { Participant, HackathonTrack } from '@/types/hackathon';
import { useSharedState } from '@/lib/shared-storage';

const tracks: HackathonTrack[] = ['Web', 'AI/ML', 'Blockchain', 'Open Innovation'];

const RegisterPage = () => {
  const { state, updateState } = useSharedState();
  const participants = state.participants || [];
  const [form, setForm] = useState({
    name: '',
    email: '',
    college: '',
    skill: '',
    track: '' as HackathonTrack | '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.college || !form.skill || !form.track) {
      toast.error('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (participants.some(p => p.email.toLowerCase() === form.email.toLowerCase())) {
      toast.error('A participant with this email already exists');
      return;
    }

    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      college: form.college.trim(),
      skill: form.skill.trim(),
      track: form.track as HackathonTrack,
      checkInStatus: 'Not Checked-In',
      teamName: null,
    };

    updateState(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }), `registered ${newParticipant.name}`);
    
    setForm({ name: '', email: '', college: '', skill: '', track: '' });
    toast.success(`${newParticipant.name} registered successfully!`);
  };

  const inputClass =
    'w-full h-11 px-4 rounded-md bg-white border border-[#CBD5E1] text-[13px] text-[#1B2533] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#106292] focus:ring-1 focus:ring-[#106292]/20 transition-all';

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-8">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-md bg-[#106292]/10 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-[#106292]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1B2533]">Register Participant</h2>
            <p className="text-sm font-medium text-[#64748B] mt-1">Enroll a new hacker into the protocol system</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider ml-1">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className={inputClass} maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider ml-1">Work Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@company.com" className={inputClass} maxLength={255} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider ml-1">Organization / College</label>
              <input name="college" value={form.college} onChange={handleChange} placeholder="Engineering Institute" className={inputClass} maxLength={200} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider ml-1">Core Expertise</label>
              <input name="skill" value={form.skill} onChange={handleChange} placeholder="Full-Stack, ML Ops..." className={inputClass} maxLength={100} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider ml-1">Assigned Track</label>
            <select name="track" value={form.track} onChange={handleChange} className={`${inputClass} font-medium`}>
              <option value="">Select track...</option>
              {tracks.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-4 rounded-md bg-[#106292] text-white font-bold text-[14px] hover:bg-[#0D547D] transition-colors shadow-sm active:scale-[0.99]"
          >
            Confirm Registration
          </button>
        </form>
      </div>

      <div className="mt-8 bg-white/50 rounded-lg p-4 border-2 border-dashed border-[#E2E8F0] text-center">
        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest leading-none">
          Cumulative Registry: <span className="text-[#106292] text-sm ml-1">{participants.length}</span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
