"use client";
import { motion } from "framer-motion";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/modules/shared/presentation/components/ui/card";
import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "$29.99",
    period: "per month",
    description: "Digital front desk for solo specialists who need better agendas and patient tracking",
    features: [
      { text: "Patient CRM + profiles", included: true },
      { text: "Smart scheduling & reminders", included: true },
      { text: "AI note suggestions", included: true },
      { text: "Basic billing exports", included: true },
      { text: "Automation rules", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Dedicated success partner", included: false },
    ],
    cta: "Start free trial",
    popular: false,
  },
  {
    name: "Clinic",
    price: "$49.99",
    period: "per month",
    description: "All-in-one operating system for growing clinics that need finances, staff, and AI copilots aligned",
    features: [
      { text: "Unlimited providers & locations", included: true },
      { text: "Automation builder", included: true },
      { text: "AI diagnostic & coding cues", included: true },
      { text: "Revenue & KPI dashboards", included: true },
      { text: "Integrated payments", included: true },
      { text: "Role-based permissions", included: true },
      { text: "Dedicated success partner", included: false },
    ],
    cta: "Book a demo",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "annual partnership",
    description: "Compliance-grade deployment for hospital groups needing integrations, SSO, and private AI tuning",
    features: [
      { text: "Everything in Clinic", included: true },
      { text: "24/7 priority support", included: true },
      { text: "Dedicated success partner", included: true },
      { text: "Private data lake", included: true },
      { text: "Custom integrations", included: true },
      { text: "White-label portals", included: true },
      { text: "Advanced compliance reviews", included: true },
    ],
    cta: "Talk to sales",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Choose Your <span className="text-primary">Pricing Plan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Three straightforward tiers built for clinical teams of every size
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <Card
                className={`h-full flex flex-col ${
                  plan.popular ? "border-primary shadow-lg scale-105" : "border-border"
                }`}
              >
                <CardHeader className="text-center pb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full rounded-xl ${plan.popular ? "gradient-primary text-white" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-8 text-muted-foreground"
        >
          All plans include HIPAA-compliant infrastructure, AI guardrails, and white-glove migration support
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;

