import { headers } from "next/headers";
import { cache } from "react";
import { auth, BetterOrganization } from "../auth-server";

export const getOrganization = cache(async (): Promise<BetterOrganization | null> => {
  return await auth.api.getFullOrganization({
    headers: await headers(),
    query: {
      membersLimit: 0,
    },
  });
});

