import { SidebarInset, SidebarProvider } from "@/modules/shared/presentation/components/ui/sidebar";
import { AppSidebar } from "./_components/sidebar/app-sidebar";
import { Header } from "./_components/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex flex-col px-6 ">
          <Header />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

