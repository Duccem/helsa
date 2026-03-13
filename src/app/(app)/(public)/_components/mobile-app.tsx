"use client";
import { motion } from "framer-motion";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Smartphone, Download, Apple, PlayCircle } from "lucide-react";

const mobileFeatures = [
  {
    title: "Manage patient queues",
    description: "Review arrivals, confirm check-ins, and reprioritize urgent visits without sitting at your desk.",
  },
  {
    title: "AI insights everywhere",
    description: "Receive diagnostic nudges, coding reminders, and supply alerts as push notifications.",
  },
  {
    title: "Approve schedules",
    description: "Authorize overtime, swap providers, and release standby slots in seconds.",
  },
  {
    title: "Secure collaboration",
    description: "Coordinate with finance and care teams through HIPAA-compliant messaging and tasks.",
  },
];

const MobileApp = () => {
  return (
    <section className=" bg-background relative overflow-hidden min-h-screen">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-1/3 h-full gradient-soft opacity-30 -z-10" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Smartphone className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Mobile ops</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Your clinic command center, <span className="text-primary">always with you</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Review patients, finances, and AI alerts on any device so decisions never wait for office hours.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Phone Mockups */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="flex items-center justify-center space-x-4 relative">
              {/* Center phone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative z-10"
              >
                <div className="w-64 rounded-3xl overflow-hidden shadow-2xl border-8 border-foreground/10">
                  <img src={"/images/mobile-app-1.jpg"} alt="Mobile app dashboard" className="w-full h-auto" />
                </div>
              </motion.div>

              {/* Left phone (slightly behind) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute left-0 top-12 opacity-70"
              >
                <div className="w-56 rounded-3xl overflow-hidden shadow-xl border-8 border-foreground/10">
                  <img src={"/images/mobile-app-2.jpg"} alt="Session booking" className="w-full h-auto" />
                </div>
              </motion.div>

              {/* Right phone (slightly behind) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute right-0 top-12 opacity-70"
              >
                <div className="w-56 rounded-3xl overflow-hidden shadow-xl border-8 border-foreground/10">
                  <img src={"/images/mobile-app-3.jpg"} alt="Progress tracking" className="w-full h-auto" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              {mobileFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="space-y-4 pt-4">
              <p className="font-semibold text-lg">Download now</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-2xl">
                  <Apple className="w-5 h-5 mr-2" />
                  App Store
                </Button>
                <Button size="lg" variant="outline" className="rounded-2xl">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Google Play
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Available on iOS 14+ and Android 8+</p>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { number: "1,200+", label: "Clinics live on mobile" },
            { number: "38K", label: "Providers synced daily" },
            { number: "-37%", label: "No-show impact" },
            { number: "+22%", label: "Faster billing cycles" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-primary mb-1">{stat.number}</div>
              <div className="text-sm ">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MobileApp;

