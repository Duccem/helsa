import AICompanion from "./_components/ai-companion";
import ClinicBenefits from "./_components/clinic-benefits";
import CTA from "./_components/cta";
import Features from "./_components/features";
import ForTherapists from "./_components/for-therapist";
import Hero from "./_components/hero";
import HowItWorks from "./_components/how-work";

export default function Page() {
  return (
    <div className="flex flex-col px-6 py-3 w-full gap-6">
      <Hero />
      <Features />
      <AICompanion />
      {/* <MobileApp /> */}
      <ForTherapists />
      <ClinicBenefits />
      <HowItWorks />
      <CTA />
      {/* <Pricing /> */}
    </div>
  );
}

