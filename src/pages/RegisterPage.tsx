import { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { Participant, HackathonTrack } from '@/types/hackathon';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const tracks: HackathonTrack[] = ['Web', 'AI/ML', 'Blockchain', 'Open Innovation'];

const RegisterPage = () => {
  const [participants, setParticipants] = useLocalStorage<Participant[]>('hackathon-participants', []);
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

    setParticipants(prev => [...prev, newParticipant]);
    setForm({ name: '', email: '', college: '', skill: '', track: '' });
    toast.success(`${newParticipant.name} registered successfully!`);
  };

  const inputClass =
    'w-full h-11 px-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all';

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="glass-card rounded-2xl p-8 gradient-border">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Register Participant</h2>
            <p className="text-xs text-muted-foreground">Add a new participant to the hackathon</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className={inputClass} maxLength={100} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" className={inputClass} maxLength={255} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">College / Organization</label>
              <input name="college" value={form.college} onChange={handleChange} placeholder="MIT" className={inputClass} maxLength={200} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Primary Skill</label>
              <input name="skill" value={form.skill} onChange={handleChange} placeholder="React, Python..." className={inputClass} maxLength={100} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Hackathon Track</label>
            <select name="track" value={form.track} onChange={handleChange} className={inputClass}>
              <option value="">Select a track</option>
              {tracks.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            Register Participant
          </button>
        </form>
      </div>

      <div className="mt-6 glass-card rounded-2xl p-4 text-center">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{participants.length}</span> participants registered so far
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
