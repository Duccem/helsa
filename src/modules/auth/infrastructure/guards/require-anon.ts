import { redirect } from "next/navigation";
import { getSession } from "../helpers/get-session";

export async function requireAnon() {
  const session = await getSession();

  if (session) {
    return redirect("/dashboard" as any);
  }

  return null;
}

