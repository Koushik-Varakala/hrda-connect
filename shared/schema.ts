import { pgTable, text, serial, boolean, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  date: date("date").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const panels = pgTable("panels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  district: text("district"), // null for state level
  isStateLevel: boolean("is_state_level").default(false).notNull(),
  imageUrl: text("image_url"),
  phone: text("phone"),
  priority: serial("priority"), // for ordering
  category: text("category").default('state_executive'), // 'state_executive', 'elected_member'
  active: boolean("active").default(true).notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: date("date"),
  imageUrl: text("image_url"),
  category: text("category").default('association').notNull(), // 'association', 'legal', 'post_election', 'legacy'
  active: boolean("active").default(true).notNull(),
});

export const mediaCoverage = pgTable("media_coverage", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: date("date"),
  imageUrl: text("image_url").notNull(),
  active: boolean("active").default(true).notNull(),
});

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'academic', 'sports', 'culture'
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cache/Mirror of registrations for search & verification
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  tgmcId: text("tgmc_id"), // Can be null if not yet assigned
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address"),
  membershipType: text("membership_type").default('single'), // single, couple
  paymentStatus: text("payment_status").default('pending'), // pending, success, failed
  razorpayTxnId: text("razorpay_txn_id"),
  registrationSource: text("registration_source").default('site_contact'),
  status: text("status").default('pending_verification'), // pending_verification, verified, rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === SCHEMAS ===

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });
export const insertPanelSchema = createInsertSchema(panels).omit({ id: true, priority: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export const insertMediaCoverageSchema = createInsertSchema(mediaCoverage).omit({ id: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, updatedAt: true });
export const insertRegistrationSchema = createInsertSchema(registrations).omit({ id: true, createdAt: true, updatedAt: true });

// === EXPLICIT API TYPES ===

// Announcements
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type CreateAnnouncementRequest = InsertAnnouncement;
export type UpdateAnnouncementRequest = Partial<InsertAnnouncement>;

// Panels
export type Panel = typeof panels.$inferSelect;
export type InsertPanel = z.infer<typeof insertPanelSchema>;
export type CreatePanelRequest = InsertPanel;
export type UpdatePanelRequest = Partial<InsertPanel>;

// Achievements
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type CreateAchievementRequest = InsertAchievement;
export type UpdateAchievementRequest = Partial<InsertAchievement>;

// Media Coverage
export type MediaCoverage = typeof mediaCoverage.$inferSelect;
export type InsertMediaCoverage = z.infer<typeof insertMediaCoverageSchema>;
export type CreateMediaCoverageRequest = InsertMediaCoverage;
export type UpdateMediaCoverageRequest = Partial<InsertMediaCoverage>;

// Departments
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type UpdateDepartmentRequest = Partial<InsertDepartment>;

// Registrations
export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type CreateRegistrationRequest = InsertRegistration;
export type UpdateRegistrationRequest = Partial<InsertRegistration>;

// Search Params
export interface SearchRegistrationParams {
  tgmcId?: string;
  phone?: string;
}

export type RegistrationSearchResponse = Registration[];
