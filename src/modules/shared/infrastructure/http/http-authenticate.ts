import { auth } from "@/modules/auth/infrastructure/auth-server";
import { getOrganization } from "@/modules/auth/infrastructure/helpers/get-organization";
import { getSession } from "@/modules/auth/infrastructure/helpers/get-session";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function authenticate() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return session;
}

export async function authenticateOrg() {
  const organization = await getOrganization();

  if (!organization) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return organization;
}

export async function hasPermission(permissions: any) {
  const has = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions,
    },
  });

  if (has.error || !has.success) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return has.success;
}

