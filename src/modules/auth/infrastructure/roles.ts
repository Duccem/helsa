import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

const admin = adminAc;
const doctor = ac.newRole({
  organization: [],
  invitation: [],
  member: [],
});

export const roles = {
  admin,
  doctor,
};

