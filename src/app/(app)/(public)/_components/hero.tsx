"use client";
import { Avatar, AvatarFallback } from "@/modules/shared/presentation/components/ui/avatar";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { ArrowRight, Brain } from "lucide-react";
import { motion, type Variants } from "motion/react";
import Link from "next/link";
import { WordAnimation } from "./word-animation";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 2, transition: { duration: 0.5 } },
};
export default function Hero() {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 h-full gap-4"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <div className="flex flex-col gap-6  justify-center px-0 md:px-12 relative h-screen md:h-full">
        <motion.span
          className="inline-flex w-fit items-center gap-2 rounded-full border border-border/50 px-4 py-2 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          variants={fadeUp}
        >
          <span className="size-2 rounded-full bg-primary" />
          Coming soon | Early access
        </motion.span>
        <motion.div className="text-3xl md:text-6xl font-light leading-10 md:leading-20 text-balance" variants={fadeUp}>
          The all-in-one platform for{" "}
          <span className="text-foreground">
            <WordAnimation />
          </span>
          .
        </motion.div>
        <motion.p className="text-sm md:text-lg text-muted-foreground" variants={fadeUp}>
          Unite patient management, scheduling, billing, and AI guidance so medical teams can focus on care instead of
          busywork. We&apos;re rolling this out soon to a limited group of clinics—join the list to be first in line.
        </motion.p>
        <motion.div className="w-full flex gap-3 md:gap-6" variants={fadeUp}>
          <Link href={"#cta" as any}>
            <Button size="lg" className="rounded-3xl group cursor-pointer">
              Join the waitlist
              <span className="inline-flex w-0 ml-0 overflow-hidden transition-all duration-200 group-hover:w-4 group-hover:ml-1">
                <ArrowRight className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
              </span>
            </Button>
          </Link>
        </motion.div>
      </div>
      <motion.div className="rounded-2xl overflow-hidden md:h-[calc(100vh-1.5rem)] relative" variants={fadeIn}>
        <motion.img src="/images/doctors/doctors-1.jpg" alt="" className="object-cover" variants={fadeIn} />
        <motion.div
          className="absolute bottom-48 md:bottom-32 left-2 right-2 flex flex-col gap-4 h-32 rounded-2xl p-6"
          variants={containerVariants}
        >
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full" variants={containerVariants}>
            <motion.div className="bg-background rounded-2xl p-4 flex items-center gap-4" variants={fadeUp}>
              <div className="size-20 overflow-hidden rounded-2xl">
                <img src="/images/doctors/doctor-1.jpg" alt="doctor" className="object-cover" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="font-semibold text-lg">Dr. Sarah Jonson</div>
                <Button className="rounded-2xl" size={"sm"}>
                  View schedule
                </Button>
              </div>
            </motion.div>
            <motion.div className="bg-background rounded-2xl p-4 items-center gap-4 hidden md:flex" variants={fadeUp}>
              <div className="size-20 overflow-hidden rounded-2xl">
                <img src="/images/doctors/doctors-6.jpg" alt="doctor" className="object-cover" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="font-semibold text-lg">Dr. Fran Miller</div>
                <Button className="rounded-2xl" size={"sm"}>
                  Manage agenda
                </Button>
              </div>
            </motion.div>
            <motion.div className="bg-background rounded-2xl p-4 items-center gap-4 hidden md:flex" variants={fadeUp}>
              <div className="size-20 overflow-hidden rounded-2xl">
                <img src="/images/doctors/doctor-7.jpg" alt="doctor" className="object-cover" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="font-semibold text-lg">Dr. Ryan Reyn</div>
                <Button className="rounded-2xl" size={"sm"}>
                  Assign cases
                </Button>
              </div>
            </motion.div>
          </motion.div>
          <motion.div className="w-full bg-background p-4 rounded-2xl flex items-center gap-4" variants={fadeUp}>
            <p>Trusted by clinical directors modernizing multi-specialty operations.</p>
            <div className="bg-primary/60 text-white p-2 rounded-lg">
              <Brain />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

