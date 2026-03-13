export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex font-sans">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary ">
        <div className="relative z-10 flex flex-col justify-between w-full px-12 py-12">
          <div className="flex items-center">
            <img src="/images/helsa-logo-all-white.png" alt="" className="h-8" />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl text-white mb-6 leading-tight">Making easy the access to health to every one</h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Log in to access your personalized dashboard, where you can manage your health data, track your progress,
              and receive tailored insights to help you achieve your wellness goals.
            </p>
          </div>

          <div className="flex justify-between items-center text-white/70 text-sm">
            <span>Copyright © 2025 Helsa Enterprises LTD.</span>
            <span className="cursor-pointer hover:text-white/90">Privacy Policy</span>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 flex-col">
        <div className="w-full  space-y-8">
          <div className=" flex flex-col items-center justify-center gap-2  text-center mb-8">
            <img src="/images/logo.png" alt="" className="h-10 rounded-sm" />
            <h1 className="text-2xl font-semibold text-foreground">Helsa</h1>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

