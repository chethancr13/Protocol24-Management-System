import { motion } from 'framer-motion';
import { Globe, Brain, Shield, Leaf, Heart, Cpu } from 'lucide-react';

const problems = [
  { icon: Brain, title: 'AI for Accessibility', desc: 'Build AI tools that make technology accessible for differently-abled individuals.', gradient: 'from-indigo-500 to-purple-500' },
  { icon: Shield, title: 'Cyber Security', desc: 'Create innovative solutions to detect and prevent modern cyber threats.', gradient: 'from-cyan-500 to-blue-500' },
  { icon: Leaf, title: 'Climate Tech', desc: 'Develop technology to monitor, reduce, or reverse environmental damage.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: Heart, title: 'HealthTech', desc: 'Revolutionize healthcare delivery with smart, affordable tech solutions.', gradient: 'from-pink-500 to-rose-500' },
  { icon: Globe, title: 'Web3 & DeFi', desc: 'Explore decentralized applications that empower users and communities.', gradient: 'from-violet-500 to-indigo-500' },
  { icon: Cpu, title: 'Open Innovation', desc: 'Build anything that pushes boundaries — surprise us with your creativity.', gradient: 'from-amber-500 to-orange-500' },
];

const ProblemStatementsSection = () => (
  <section className="py-24 px-8 relative" id="problems">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold gradient-text mb-4">Problem Statements</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">Choose your challenge. Each track pushes the boundaries of what's possible.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problems.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass-card rounded-2xl p-6 relative overflow-hidden group cursor-default"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-5`} />
              <div className={`absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br ${p.gradient} rounded-full blur-3xl opacity-20`} />
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                <p.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemStatementsSection;
