'use client';
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { BarChart3, Bot, MessageSquare, Sparkles, Target, TrendingUp, Umbrella, Users, Video } from "lucide-react";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 2, ease: [0.22, 1, 0.36, 1] },
  },
};

const aiFeatures = [
  {
    icon: MessageSquare,
    title: "24/7 Support",
    description: "Always available when you need someone to talk to",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set and track personalized mental health goals",
  },
  {
    icon: BarChart3,
    title: "Progress Insights",
    description: "Understand your patterns and celebrate improvements",
  },
];

export default function Features() {
  const prefersReducedMotion = useReducedMotion();
  const variants: Variants = prefersReducedMotion
    ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 1 } },
    }
    : itemVariants;
  return (
    <section className="flex flex-col w-full px-6 pt-12 items-center min-h-screen">
      <div className="max-w-5xl text-center text-balance space-y-4">
        <p className="text-5xl md:text-6xl text-muted-foreground font-light leading-tight">
          Everything you need to run a <span className="text-foreground">next-gen clinic</span>.
        </p>
        <p className="text-xl md:text-2xl font-light">
          Helsa unifies patient intake, scheduling, finances, and AI support so every provider and back-office team operates from the same source of truth.
        </p>
        <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/80">
          Launching soon | Secure early access today
        </p>
      </div>

      {/* Bento grid */}
      <div
        id="bento"
        className="mt-12 grid w-full container mx-4 grid-cols-1 gap-4 md:grid-cols-8"
      >
        <motion.div
          className="rounded-2xl overflow-hidden md:col-span-2 md:row-span-3 relative flex flex-col justify-between p-6"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="absolute inset-0  " >
            <img src="/images/doctors/doctors-4.jpg" alt="" />
          </div>
          <div className="flex z-10">
            <div className="rounded-full bg-white p-4">
              <Video className="size-8 text-black" />
            </div>
          </div>
          <div className="z-10">
            <p className="p-4 bg-white rounded-xl text-black">Integrated care timeline</p>
          </div>
        </motion.div>
        <motion.div
          className=" rounded-2xl overflow-hidden bg-primary/60 md:col-span-2 md:row-span-2 flex flex-col justify-between p-6"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >

          <div className="flex">
            <div className="rounded-full bg-white p-4">
              <Sparkles className="size-8 text-black" />
            </div>
          </div>
          <div className="z-10">
            <p className="text-3xl font-light text-white">Automated workflows</p>
          </div>
        </motion.div>
        <motion.div
          className="relative rounded-2xl overflow-hidden  md:col-span-2 md:row-span-2 hidden md:flex flex-col justify-between p-6"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="absolute inset-0" >
            <img src="/images/doctors/doctors-2.jpg" alt="" />
          </div>
        </motion.div>
        <motion.div
          className="rounded-2xl overflow-hidden bg-neutral-400 md:col-span-2 md:row-span-1 flex p-6"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex flex-1">
            <div className="rounded-full bg-white p-4 flex justify-center items-center">
              <Bot className="size-8 text-black" />
            </div>

          </div>
          <div className="z-10 flex-1">
            <p className="text-xl font-light text-white">AI assistant for diagnostics</p>
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl overflow-hidden bg-neutral-400 md:col-span-2 md:row-span-1 flex gap-3  p-6"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex flex-1">
            <div className="rounded-full bg-white p-4">
              <TrendingUp className="size-8 text-black" />
            </div>
          </div>
          <div className="z-10 flex-1">
            <p className="text-xl font-light text-white">Revenue & KPI tracking</p>
          </div>
        </motion.div>
        <motion.div
          className="rounded-2xl overflow-hidden bg-neutral-400 md:col-span-2 md:row-span-1 flex flex-col justify-between p-6"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex">
            <div className="rounded-full bg-white p-4">
              <Users className="size-8 text-black" />
            </div>
          </div>
          <div className="z-10 flex-1">
            <p className="text-xl font-light text-white">Multi-specialty teams</p>
          </div>
        </motion.div>
        <motion.div
          className="relative rounded-2xl overflow-hidden bg-neutral-400 md:col-span-4 md:row-span-1 hidden md:flex justify-between p-6"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="absolute -top-24  " >
            <img src="/images/doctors/doctors-3.jpg" alt="" />
          </div>
          <div className="flex z-10 flex-1">
            <div>
              <div className="rounded-full bg-white p-4">
                <Umbrella className="size-8 text-black" />
              </div>
            </div>
          </div>
          <div className="z-10">
            <p className="p-4 bg-white rounded-xl text-black">Compliance monitoring</p>
          </div>
        </motion.div>
      </div>

    </section>
  )
}
