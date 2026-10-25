import { admin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  patient: ["create", "update"]
} as const;

export const ac = createAccessControl(statement);

const administrator = adminAc;
const therapist = ac.newRole({
  user: [],
  session: [],
  patient: ["create", "update"]
});
const patient = ac.newRole({
  user: ["create"],
  session: [],
  patient: ["update"]
});
const organization = ac.newRole({
  user: ["create", "set-password", "set-email"],
  session: [],
  patient: ["create", "update"]
})

export const roles = {
  administrator,
  therapist,
  patient,
  organization,
};

export const configAdminPlugin = admin({
  ac,
  roles,
  adminRoles: ["administrator"],
  defaultRole: "therapist",
})