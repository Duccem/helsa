"use client";
import { motion } from "framer-motion";
import { UserPlus, Target, Video, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Centralize clinic data",
    description: "Import patients, providers, and inventory from legacy systems or spreadsheets in a few clicks.",
  },
  {
    icon: Target,
    title: "Design smart agendas",
    description: "Build templates for specialties, automate reminders, and let Helsa avoid gaps or double-bookings.",
  },
  {
    icon: Video,
    title: "Empower care teams",
    description:
      "Give doctors and administrators the same live workspace with AI assistance embedded in every workflow.",
  },
  {
    icon: TrendingUp,
    title: "Measure & optimize",
    description: "Track revenue, utilization, and clinical quality with dashboards that highlight what to fix next.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-primary mb-4">Coming soon rollout</p>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            How <span className="text-primary">Helsa</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Launch Helsa across your organization in four predictable phases once early access opens. We&apos;ll guide
            your team through each step before the public release.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative flex gap-8 pb-12 last:pb-0"
            >
              {/* Timeline Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-full bg-linear-to-b from-primary via-primary/50 to-transparent" />
              )}

              {/* Step Number */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg z-10 relative">
                  {index + 1}
                </div>
              </div>

              {/* Content Card */}
              <div className="flex-1 bg-card border border-border rounded-2xl p-6 mt-8">
                <div className="w-14 h-14 rounded-lg bg-indigo-500/50 flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

