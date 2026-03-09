import { redirect } from "next/navigation";
import { getSession } from "../helpers/get-session";

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    return redirect("/sign-in" as any);
  }

  return session;
}

