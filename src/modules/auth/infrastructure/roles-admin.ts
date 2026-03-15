import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
} as const;

export const acAdmin = createAccessControl(statement);

const superadmin = adminAc;
const admin = acAdmin.newRole({
  user: ["set-password", "update", "delete"],
  session: [],
});
const doctor = acAdmin.newRole({
  user: [],
  session: [],
});
const patient = acAdmin.newRole({
  user: [],
  session: [],
});

export const adminRoles = {
  superadmin,
  admin,
  doctor,
  patient,
};

