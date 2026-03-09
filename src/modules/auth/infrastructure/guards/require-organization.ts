import { headers } from "next/headers";
import { auth } from "../auth-server";
import { redirect } from "next/navigation";

export async function requireOrganizations() {
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  if (organizations.length === 0) {
    return redirect("/new-organization" as any);
  }

  return null;
}

