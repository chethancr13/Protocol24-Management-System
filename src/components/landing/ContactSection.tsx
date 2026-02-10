import { motion } from 'framer-motion';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

const ContactSection = () => (
  <section className="py-24 px-8 relative" id="contact">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold gradient-text mb-4">Get in Touch</h2>
        <p className="text-muted-foreground">Have questions? Reach out to our organizing team.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Mail, label: 'Email Us', value: 'hello@hackdash.dev' },
          { icon: MapPin, label: 'Location', value: 'Innovation Hub, Pune' },
          { icon: MessageSquare, label: 'Discord', value: 'discord.gg/hackdash' },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card-hover rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
              <c.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{c.label}</h3>
            <p className="text-sm text-muted-foreground">{c.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ContactSection;
