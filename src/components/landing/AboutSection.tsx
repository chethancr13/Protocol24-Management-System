import { motion } from 'framer-motion';
import { Code2, Brain, Rocket, Globe } from 'lucide-react';

const features = [
  { icon: Code2, title: 'Build & Ship', desc: 'Turn ideas into working products in 48 hours with a team of builders.' },
  { icon: Brain, title: 'AI-Powered', desc: 'Leverage cutting-edge AI tools and APIs to create next-gen solutions.' },
  { icon: Rocket, title: 'Launch Fast', desc: 'Go from concept to demo with mentorship from industry leaders.' },
  { icon: Globe, title: 'Global Impact', desc: 'Solve real-world problems that affect millions across the globe.' },
];

const AboutSection = () => (
  <section className="py-24 px-8 relative" id="about">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold gradient-text mb-4">About the Hackathon</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          A 48-hour innovation sprint where developers, designers, and dreamers come together to build the future. No limits, just ideas.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-card-hover rounded-2xl p-6 text-center group cursor-default"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/25 transition-colors">
              <f.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
