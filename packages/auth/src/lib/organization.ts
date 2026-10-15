import { organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

const owner = adminAc;

const manager = ac.newRole({
  invitation: [],
  member: [],
  organization: [],
  team: []
});

const therapist = ac.newRole({
  invitation: [],
  member: [],
  organization: [],
  team: []
});

export const roles = {
  owner,
  manager,
  therapist
}

export const organizationConfigPlugin = organization({
  ac,
  roles,
  creatorRole: "owner",
  organizationHooks: {
    afterAcceptInvitation: async (ctx) => console.log(ctx),
    afterCreateOrganization: async (ctx) => console.log(ctx),
  },
  sendInvitationEmail: async (data) => console.log(data)
})