import { db } from "./db";
import { 
  announcements, panels, achievements, departments, registrations,
  type Announcement, type InsertAnnouncement, type UpdateAnnouncementRequest,
  type Panel, type InsertPanel, type UpdatePanelRequest,
  type Achievement, type InsertAchievement, type UpdateAchievementRequest,
  type Department, type UpdateDepartmentRequest,
  type Registration, type InsertRegistration, type UpdateRegistrationRequest, type SearchRegistrationParams
} from "@shared/schema";
import { eq, desc, and, ilike } from "drizzle-orm";

export interface IStorage {
  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, updates: UpdateAnnouncementRequest): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<void>;

  // Panels
  getPanels(type?: 'state' | 'district', district?: string): Promise<Panel[]>;
  createPanel(panel: InsertPanel): Promise<Panel>;
  updatePanel(id: number, updates: UpdatePanelRequest): Promise<Panel | undefined>;
  deletePanel(id: number): Promise<void>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: number, updates: UpdateAchievementRequest): Promise<Achievement | undefined>;
  deleteAchievement(id: number): Promise<void>;

  // Departments
  getDepartments(): Promise<Department[]>;
  updateDepartment(id: number, updates: UpdateDepartmentRequest): Promise<Department | undefined>;
  // (We seed departments initially, usually don't delete/create dynamically in this simple app, but update content)

  // Registrations
  searchRegistrations(params: SearchRegistrationParams): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistration(id: number, updates: UpdateRegistrationRequest): Promise<Registration | undefined>;
  getRegistrations(): Promise<Registration[]>;
}

export class DatabaseStorage implements IStorage {
  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.date));
  }

  async createAnnouncement(insert: InsertAnnouncement): Promise<Announcement> {
    const [result] = await db.insert(announcements).values(insert).returning();
    return result;
  }

  async updateAnnouncement(id: number, updates: UpdateAnnouncementRequest): Promise<Announcement | undefined> {
    const [result] = await db.update(announcements).set(updates).where(eq(announcements.id, id)).returning();
    return result;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Panels
  async getPanels(type?: 'state' | 'district', district?: string): Promise<Panel[]> {
    let query = db.select().from(panels);
    if (type === 'state') {
      // @ts-ignore - weird drizzle type inference on boolean sometimes
      query.where(eq(panels.isStateLevel, true));
    } else if (type === 'district') {
      // @ts-ignore
      query.where(eq(panels.isStateLevel, false));
      if (district) {
         // @ts-ignore
        query.where(and(eq(panels.isStateLevel, false), eq(panels.district, district)));
      }
    }
    return await query.orderBy(panels.priority);
  }

  async createPanel(insert: InsertPanel): Promise<Panel> {
    const [result] = await db.insert(panels).values(insert).returning();
    return result;
  }

  async updatePanel(id: number, updates: UpdatePanelRequest): Promise<Panel | undefined> {
    const [result] = await db.update(panels).set(updates).where(eq(panels.id, id)).returning();
    return result;
  }

  async deletePanel(id: number): Promise<void> {
    await db.delete(panels).where(eq(panels.id, id));
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements).orderBy(desc(achievements.date));
  }

  async createAchievement(insert: InsertAchievement): Promise<Achievement> {
    const [result] = await db.insert(achievements).values(insert).returning();
    return result;
  }

  async updateAchievement(id: number, updates: UpdateAchievementRequest): Promise<Achievement | undefined> {
    const [result] = await db.update(achievements).set(updates).where(eq(achievements.id, id)).returning();
    return result;
  }

  async deleteAchievement(id: number): Promise<void> {
    await db.delete(achievements).where(eq(achievements.id, id));
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async updateDepartment(id: number, updates: UpdateDepartmentRequest): Promise<Department | undefined> {
    const [result] = await db.update(departments).set(updates).where(eq(departments.id, id)).returning();
    return result;
  }

  // Registrations
  async searchRegistrations(params: SearchRegistrationParams): Promise<Registration[]> {
    if (params.tgmcId) {
      return await db.select().from(registrations).where(eq(registrations.tgmcId, params.tgmcId));
    }
    return [];
  }

  async createRegistration(insert: InsertRegistration): Promise<Registration> {
    const [result] = await db.insert(registrations).values(insert).returning();
    return result;
  }

  async updateRegistration(id: number, updates: UpdateRegistrationRequest): Promise<Registration | undefined> {
    const [result] = await db.update(registrations).set(updates).where(eq(registrations.id, id)).returning();
    return result;
  }
  
  async getRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  }
}

export const storage = new DatabaseStorage();
