import { SelectRole } from "@/modules/auth/presentation/components/select-role";

export default async function RoleSelectionPage() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center w-1/2">
      <div className="w-full  space-y-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center mb-8">
          <img src="/images/logo.png" alt="" className="h-10 rounded-sm" />
          <h1 className="text-2xl font-semibold text-foreground">Helsa</h1>
        </div>
      </div>
      <SelectRole />
    </div>
  );
}

