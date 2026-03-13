"use client";
import { motion } from "framer-motion";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { ClipboardCheck, Users, LineChart, Lightbulb } from "lucide-react";

const therapistFeatures = [
  {
    icon: Users,
    title: "Unified patient records",
    description: "Consolidate clinical notes, imaging, and labs so every provider sees the same up-to-date story.",
  },
  {
    icon: LineChart,
    title: "Financial pulse",
    description: "Track invoices, reimbursements, and profitability per specialty in real time.",
  },
  {
    icon: Lightbulb,
    title: "AI treatment insights",
    description: "Receive suggested diagnoses, coding guidance, and next steps backed by Helsa AI.",
  },
  {
    icon: ClipboardCheck,
    title: "Automated compliance",
    description: "Generate visit summaries, consent forms, and audit-ready logs without manual work.",
  },
];

const ForTherapists = () => {
  return (
    <section id="for-doctors" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Built for medical leaders and multi-disciplinary teams
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Coordinate physicians, nurses, and administrators with a shared workspace that keeps patients, agendas, and
            finances perfectly aligned.
          </p>
          <p className="text-sm uppercase tracking-[0.3em] text-primary mt-6">Early access cohort forming now</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={"/images/dashboard-shot.png"}
                alt="Therapist dashboard"
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <p className="text-lg text-muted-foreground leading-relaxed">
              Helsa centralizes every operational workflow—from waiting lists to insurance submissions—while AI copilots
              help clinicians deliver faster, safer diagnoses. Early adopters get white-glove onboarding ahead of the
              public launch.
            </p>

            <div className="space-y-6">
              {therapistFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button size="lg" className="rounded-3xl">
              Request early access
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ForTherapists;

