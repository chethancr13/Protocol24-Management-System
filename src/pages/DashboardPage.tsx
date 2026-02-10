import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Layers, ArrowRight } from 'lucide-react';
import { Participant, Team } from '@/types/hackathon';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

import HeroScene from '@/components/HeroScene';
import AboutSection from '@/components/landing/AboutSection';
import ProblemStatementsSection from '@/components/landing/ProblemStatementsSection';
import TimelineSection from '@/components/landing/TimelineSection';

import JudgesSection from '@/components/landing/JudgesSection';
import SubmissionSection from '@/components/landing/SubmissionSection';
import ContactSection from '@/components/landing/ContactSection';

const DashboardPage = () => {
  const [participants] = useLocalStorage<Participant[]>('hackathon-participants', []);
  const [teams] = useLocalStorage<Team[]>('hackathon-teams', []);
  const navigate = useNavigate();

  const totalParticipants = participants.length;
  const checkedIn = participants.filter(p => p.checkInStatus === 'Checked-In').length;
  const checkedOut = participants.filter(p => p.checkInStatus === 'Checked-Out').length;
  const totalTeams = teams.length;

  return (
    <div className="space-y-0 -m-8">
      {/* Hero */}
      <section className="relative overflow-hidden px-8 pt-8">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            Welcome to <span className="gradient-text">HackDash</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6"
          >
            Your command center for the ultimate hackathon experience. Build, compete, and innovate.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 justify-center mb-4"
          >
            <Button onClick={() => navigate('/register')} className="rounded-xl px-6 shadow-lg shadow-primary/20">
              Register Now <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/teams')} className="rounded-xl px-6">
              Manage Teams
            </Button>
          </motion.div>
        </div>

        <HeroScene />
      </section>

      {/* Stats */}
      <section className="px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <StatCard title="Total Participants" value={totalParticipants} icon={Users} accent="primary" />
          <StatCard title="Checked In" value={checkedIn} icon={UserCheck} accent="success" />
          <StatCard title="Checked Out" value={checkedOut} icon={UserX} accent="destructive" />
          <StatCard title="Teams" value={totalTeams} icon={Layers} accent="accent" />
        </div>
      </section>

      <AboutSection />
      <ProblemStatementsSection />
      <TimelineSection />
      
      <JudgesSection />
      <SubmissionSection />
      <ContactSection />

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Built with 💜 by <span className="gradient-text font-semibold">HackDash</span> — The Future of Hackathon Management
        </p>
      </footer>
    </div>
  );
};

export default DashboardPage;
