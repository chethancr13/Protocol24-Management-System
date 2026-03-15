import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Github, Twitter, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeroScene from '@/components/HeroScene';
import AboutSection from '@/components/landing/AboutSection';
import TimelineSection from '@/components/landing/TimelineSection';
import ProblemStatementsSection from '@/components/landing/ProblemStatementsSection';
import LeaderboardSection from '@/components/landing/LeaderboardSection';
import JudgesSection from '@/components/landing/JudgesSection';
import ContactSection from '@/components/landing/ContactSection';
import SubmissionSection from '@/components/landing/SubmissionSection';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50 h-16 flex items-center justify-between px-8 md:px-16">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">PROTOCOL 24</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#timeline" className="hover:text-primary transition-colors">Timeline</a>
          <a href="#tracks" className="hover:text-primary transition-colors">Tracks</a>
          <a href="#leaderboard" className="hover:text-primary transition-colors">Stats</a>
          <a href="#submission" className="hover:text-primary transition-colors">Submit</a>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/login')}
            className="hidden sm:flex text-muted-foreground hover:text-primary"
          >
            Organizer Login
          </Button>
          <Button 
            size="sm" 
            className="rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Now <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 flex flex-col items-center justify-center text-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6 uppercase tracking-widest"
        >
          <Shield className="w-3 h-3" /> Secure Innovation Hub
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
        >
          Building the Future <br /> 
          <span className="gradient-text">Block by Block</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-8 leading-relaxed"
        >
          Protocol 24 is the ultimate innovation marathon where developers, designers, and creators converge to build next-generation solutions.
        </motion.p>
        
        <div className="w-full max-w-5xl">
          <HeroScene />
        </div>
      </section>

      {/* Landing Sections */}
      <div className="relative">
        <AboutSection />
        <TimelineSection />
        <ProblemStatementsSection />
        <div className="bg-muted/30 py-12">
           <LeaderboardSection />
        </div>
        <JudgesSection />
        <SubmissionSection />
        <ContactSection />
      </div>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-border mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold">PROTOCOL 24</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 Protocol 24 - Organized by NullPoint</p>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Mail className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
