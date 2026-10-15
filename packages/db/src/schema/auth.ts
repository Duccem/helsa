import { defineRelationsPart } from "drizzle-orm";
import { index, pgTable, } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const user = pgTable(
  "user",
  (table) => ({
    id: table.uuid("id").primaryKey().$defaultFn(v7),
    name: table.text("name").notNull(),
    email: table.text("email").notNull().unique(),
    emailVerified: table.boolean("email_verified").default(false).notNull(),
    image: table.text("image"),
    createdAt: table.timestamp("created_at").defaultNow().notNull(),
    updatedAt: table.timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  })
);

export const session = pgTable(
  "session",
  (table) => ({
    id: table.uuid("id").primaryKey().$defaultFn(v7),
    expiresAt: table.timestamp("expires_at").notNull(),
    token: table.text("token").notNull().unique(),
    createdAt: table.timestamp("created_at").defaultNow().notNull(),
    updatedAt: table.timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: table.text("ip_address"),
    userAgent: table.text("user_agent"),
    userId: table.text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activeOrganizationId: table.uuid("active_organization_id"),
    impersonatedBy: table.uuid("impersonated_by").references(() => user.id),
  }),
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  (table) => ({
    id: table.uuid("id").primaryKey().$defaultFn(v7),
    accountId: table.text("account_id").notNull(),
    providerId: table.text("provider_id").notNull(),
    userId: table.text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: table.text("access_token"),
    refreshToken: table.text("refresh_token"),
    idToken: table.text("id_token"),
    accessTokenExpiresAt: table.timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: table.timestamp("refresh_token_expires_at"),
    scope: table.text("scope"),
    password: table.text("password"),
    createdAt: table.timestamp("created_at").defaultNow().notNull(),
    updatedAt: table.timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  }),
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  (table) => ({
    id: table.uuid("id").primaryKey().$defaultFn(v7),
    identifier: table.text("identifier").notNull(),
    value: table.text("value").notNull(),
    expiresAt: table.timestamp("expires_at").notNull(),
    createdAt: table.timestamp("created_at").defaultNow().notNull(),
    updatedAt: table.timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  }),
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organization = pgTable(
  "organization",
  (table) => ({
    id: table.uuid("id").primaryKey().$defaultFn(v7),
    name: table.text("name").notNull(),
    slug: table.text("slug").notNull().unique(),
    logo: table.text("logo"),
    metadata: table.text("metadata"),
    createdAt: table.timestamp("created_at").defaultNow().notNull(),
  }),
  (table) => [index("organization_slug_idx").on(table.slug)],
);

export const member = pgTable(
  "member",
  (table) => ({
    id: table.uuid("id").primaryKey().defaultRandom(),
    userId: table
      .uuid("user_id")
      .notNull()
      .references(() => user.id),
    organizationId: table
      .uuid("organization_id")
      .notNull()
      .references(() => organization.id),
    role: table.text("role").notNull(),
    createdAt: table.timestamp("created_at").defaultNow().notNull(),
  }),
  (table) => [
    index("member_user_org_idx").on(table.userId, table.organizationId),
  ],
);

export const invitation = pgTable("invitation", (table) => ({
  id: table.uuid("id").primaryKey().defaultRandom(),
  email: table.text("email").notNull(),
  inviterId: table
    .uuid("inviter_id")
    .notNull()
    .references(() => user.id),
  organizationId: table
    .uuid("organization_id")
    .notNull()
    .references(() => organization.id),
  role: table.text("role").notNull(),
  status: table.text("status").notNull(),
  expiresAt: table.timestamp("expires_at").notNull(),
  createdAt: table.timestamp("created_at").defaultNow().notNull(),
}));

export const authRelations = defineRelationsPart(
  { user, session, account, verification, organization, member, invitation },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
      member: r.many.member({
        from: r.user.id,
        to: r.member.userId
      }),
      invitations: r.many.invitation({
        from: r.user.id,
        to: r.invitation.inviterId
      })
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },
    organization: {
      members: r.many.member({
        from: r.organization.id,
        to: r.member.organizationId,
      }),
      invitations: r.many.invitation({
        from: r.organization.id,
        to: r.invitation.organizationId
      })
    },
    member: {
      organization: r.one.organization({
        from: r.member.organizationId,
        to: r.organization.id
      }),
      user: r.one.user({
        from: r.member.userId,
        to: r.user.id
      })
    },
    invitation: {
      inviter: r.one.user({
        from: r.invitation.inviterId,
        to: r.user.id
      }),
      organization: r.one.organization({
        from: r.invitation.organizationId,
        to: r.organization.id
      })
    }
  }),
);

