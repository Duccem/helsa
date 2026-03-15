import { organizationClient, lastLoginMethodClient, adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, roles } from "./roles";
import { acAdmin, adminRoles } from "./roles-admin";
export const authClient = createAuthClient({
  plugins: [
    organizationClient({ ac, roles }),
    adminClient({ ac: acAdmin, roles: adminRoles }),
    lastLoginMethodClient(),
  ],
});

