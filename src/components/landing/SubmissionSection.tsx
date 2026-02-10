import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SubmissionSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleSubmit = () => {
    setSubmitted(true);
    // Confetti particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  };

  return (
    <section className="py-24 px-8 relative overflow-hidden" id="submission">
      {/* Confetti */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: '50%', x: `${p.x}%`, scale: 0 }}
            animate={{ opacity: 0, y: '-100%', scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute w-3 h-3 rounded-full pointer-events-none z-50"
            style={{
              background: ['#6366f1', '#06b6d4', '#a855f7', '#ec4899', '#f59e0b'][p.id % 5],
            }}
          />
        ))}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold gradient-text mb-4">Project Submission</h2>
          <p className="text-muted-foreground">Upload your project demo and documentation.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-8 text-center"
        >
          {!submitted ? (
            <>
              <div className="border-2 border-dashed border-border rounded-xl p-12 mb-6 hover:border-primary/40 transition-colors">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium mb-1">Drag & drop your files here</p>
                <p className="text-sm text-muted-foreground">or click to browse (ZIP, PDF, up to 50MB)</p>
              </div>
              <Button onClick={handleSubmit} className="rounded-xl px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Submit Project
              </Button>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Submitted Successfully! 🎉</h3>
              <p className="text-muted-foreground">Your project has been received. Good luck!</p>
              <Button variant="ghost" onClick={() => setSubmitted(false)} className="mt-4">
                Submit Another
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default SubmissionSection;
