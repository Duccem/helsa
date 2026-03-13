'use client';
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { BarChart3, MessageSquare, Sparkles, Target } from "lucide-react";
const aiFeatures = [
  {
    icon: MessageSquare,
    title: "Clinical briefings",
    description: "Surface high-risk patients, coding opportunities, and unanswered tasks before every consult.",
  },
  {
    icon: Target,
    title: "Agenda intelligence",
    description: "Auto-balance provider schedules, flag double-bookings, and recommend follow-up windows.",
  },
  {
    icon: BarChart3,
    title: "Financial insights",
    description: "Monitor revenue, no-show impact, and payer mix with proactive alerts for your admin team.",
  },
];

export default function AICompanion() {
  return (
    <section className="py-24 bg-background relative overflow-hidden min-h-screen">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full gradient-soft opacity-50 -z-10" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl"
              >
                <img
                  src={'/images/ai-companion.jpg'}
                  alt="AI Companion"
                  className="w-full h-auto object-cover"
                />
              </motion.div>

              {/* Floating message bubbles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute -top-4 -right-4 bg-card/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-border max-w-xs"
              >
                <div className="text-sm text-muted-foreground mb-2">AI Operations Assistant</div>
                <div className="text-foreground">
                  "3 cardiology follow-ups lack labs. Cash flow forecast up 12% after automations. Suggested actions ready."
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI clinic copilot</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Your clinical <span className="text-primary">AI co-pilot</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Helsa AI analyzes charts, agendas, and collections in real time to recommend the next best action. Physicians receive diagnostic cues while operations teams get instant insight on caseloads and cash flow.
            </p>

            <div className="space-y-6">
              {aiFeatures.map((feature, index) => (
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
          </motion.div>
        </div>
      </div>
    </section>
  )
}