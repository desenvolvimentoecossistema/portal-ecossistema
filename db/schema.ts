import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const portalImports = sqliteTable("portal_imports", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  counts: text("counts").notNull(),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  startDate: text("start_date").notNull(),
  startTime: text("start_time").notNull().default(""),
  endDate: text("end_date").notNull(),
  endTime: text("end_time").notNull().default(""),
  registrationDeadline: text("registration_deadline").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  venue: text("venue").notNull(),
  address: text("address").notNull(),
  meetingPoint: text("meeting_point").notNull(),
  arrivalGuidance: text("arrival_guidance").notNull(),
  transport: text("transport").notNull(),
  accommodation: text("accommodation").notNull(),
  meals: text("meals").notNull(),
  accessibility: text("accessibility").notNull(),
  preparation: text("preparation").notNull(),
  dressCode: text("dress_code").notNull(),
  costs: text("costs").notNull(),
  additionalNotes: text("additional_notes").notNull().default(""),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  maxParticipants: integer("max_participants").notNull(),
  createdByUserId: text("created_by_user_id").notNull().default(""),
  creatorEmail: text("creator_email").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull().default(""),
});

export const eventDrafts = sqliteTable("event_drafts", {
  id: text("id").primaryKey(),
  createdByUserId: text("created_by_user_id").notNull(),
  payload: text("payload").notNull(),
  sourceName: text("source_name").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const registrations = sqliteTable(
  "registrations",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    organization: text("organization").notNull(),
    role: text("role").notNull(),
    accessibilityNeeds: text("accessibility_needs").notNull().default(""),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_registrations_event_email").on(table.eventId, table.email),
  ],
);

export const removedDemoEvents = sqliteTable("removed_demo_events", {
  eventId: text("event_id").primaryKey(),
  removedByUserId: text("removed_by_user_id").notNull(),
  removedAt: text("removed_at").notNull(),
});

export const appUserRoles = sqliteTable("app_user_roles", {
  email: text("email").primaryKey(),
  displayName: text("display_name").notNull().default(""),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const oauthStates = sqliteTable("oauth_states", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  verifier: text("verifier").notNull(),
  nonce: text("nonce").notNull(),
  returnTo: text("return_to").notNull(),
  expiresAt: integer("expires_at").notNull(),
  consumedAt: integer("consumed_at").notNull().default(0),
});

export const oauthSessions = sqliteTable("oauth_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
