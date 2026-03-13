"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Input } from "@/modules/shared/presentation/components/ui/input";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

const CTA = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const response = await fetch("/api/email/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setSubmitted(true);
        setEmail("");
      } else {
        const data = await response.json();
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden" id="cta">
      {/* Gradient Background */}
      <div className="absolute inset-0  opacity-90" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">Product launch coming soon</p>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">Join the Helsa waitlist</h2>
          <p className="text-xl text-foreground mb-8 leading-relaxed">
            Be the first to modernize your clinic’s operations with AI-native workflows, collaborative care tools, and
            real-time financial insights. We&apos;ll notify you as soon as early access invitations go out.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col lg:flex-row gap-4 justify-center items-stretch"
            aria-label="Join the Helsa waitlist"
          >
            <Input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your work email"
              className="h-10 text-lg rounded-3xl bg-background/80 border border-foreground/20"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) {
                  setError(null);
                }
                if (submitted) {
                  setSubmitted(false);
                }
              }}
              required
            />
            <Button size="lg" className="rounded-3xl group">
              Join the waitlist
              <span className="inline-flex w-0 ml-0 overflow-hidden transition-all duration-200 group-hover:w-4 group-hover:ml-1">
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ArrowRight className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                )}
              </span>
            </Button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 space-y-2 text-foreground"
          >
            {error && (
              <p className="text-red-500 text-sm" role="alert">
                {error}
              </p>
            )}
            {submitted && !error && (
              <p className="flex items-center justify-center text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Thanks! You&apos;re on the list — we&apos;ll reach out soon.
              </p>
            )}
            <p className="text-sm opacity-80">HIPAA-ready infrastructure • White-glove onboarding • Cancel anytime</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;

