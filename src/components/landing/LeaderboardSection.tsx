import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';

const teams = [
  { name: 'Team Nexus', score: 95, track: 'AI/ML' },
  { name: 'CyberForge', score: 89, track: 'Cyber Security' },
  { name: 'GreenPulse', score: 84, track: 'Climate Tech' },
  { name: 'HealthSync', score: 78, track: 'HealthTech' },
  { name: 'BlockWave', score: 72, track: 'Web3 & DeFi' },
];

const icons = [Trophy, Medal, Award];

const LeaderboardSection = () => (
  <section className="py-24 px-8 relative" id="leaderboard">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold gradient-text mb-4">Leaderboard</h2>
        <p className="text-muted-foreground">Top performing teams ranked by judges' score.</p>
      </motion.div>

      <div className="space-y-4">
        {teams.map((t, i) => {
          const Icon = icons[i] || Award;
          return (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-5 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                i === 1 ? 'bg-gray-400/20 text-gray-300' :
                i === 2 ? 'bg-amber-600/20 text-amber-500' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < 3 ? <Icon className="w-5 h-5" /> : `#${i + 1}`}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-semibold text-foreground">{t.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{t.track}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{t.score}/100</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${t.score}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default LeaderboardSection;
