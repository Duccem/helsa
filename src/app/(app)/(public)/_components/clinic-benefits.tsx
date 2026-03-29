"use client";
import { motion } from "framer-motion";
import { Building2, CalendarClock, ShieldCheck, Sparkles, Wallet } from "lucide-react";

const benefits = [
  {
    icon: Building2,
    title: "Centralized operations",
    description: "Run schedules, inventory, and rooms from a single command center for every facility.",
  },
  {
    icon: Wallet,
    title: "Real-time finances",
    description: "Track revenue, costs, and collections per service line with alerts when trends shift.",
  },
  {
    icon: CalendarClock,
    title: "Superior patient experience",
    description: "Cut no-shows with smart reminders, self-service portals, and digital check-ins.",
  },
  {
    icon: ShieldCheck,
    title: "Security & compliance",
    description: "Audit-ready records, access controls, and HIPAA policies available on day one.",
  },
];

const stats = [
  { label: "Fewer no-shows", value: "-35%" },
  { label: "Faster month-end close", value: "2x" },
  { label: "Happier care teams", value: "+28%" },
];

export default function ClinicBenefits() {
  return (
    <section className="py-24 bg-background" id="for-clinics">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-indigo-500/50 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Clinic benefits | Coming soon</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Built for medical centers ready to scale</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Helsa connects administrative and clinical teams so every day blends operational efficiency, financial
            insight, and real-time AI support.
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-4">
            We&apos;re finalizing the launch now—join the waitlist to be notified when Helsa is available for your
            facilities.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border border-border rounded-2xl p-6 bg-card"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-500/50 flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center border border-dashed border-border rounded-2xl p-6">
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

