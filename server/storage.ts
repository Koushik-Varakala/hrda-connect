import { db } from "./db";
import {
  announcements, panels, achievements, departments, registrations, mediaCoverage,
  type Announcement, type InsertAnnouncement, type UpdateAnnouncementRequest,
  type Panel, type InsertPanel, type UpdatePanelRequest,
  type Achievement, type InsertAchievement, type UpdateAchievementRequest,
  type MediaCoverage, type InsertMediaCoverage, type UpdateMediaCoverageRequest,
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
  getAchievements(category?: string): Promise<Achievement[]>;
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

  // Media Coverage
  getMediaCoverage(): Promise<MediaCoverage[]>;
  createMediaCoverage(media: InsertMediaCoverage): Promise<MediaCoverage>;
  updateMediaCoverage(id: number, updates: UpdateMediaCoverageRequest): Promise<MediaCoverage | undefined>;
  deleteMediaCoverage(id: number): Promise<void>;
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
  async getAchievements(category?: string): Promise<Achievement[]> {
    let query = db.select().from(achievements);
    if (category) {
      // @ts-ignore
      query.where(eq(achievements.category, category));
    }
    return await query.orderBy(desc(achievements.date));
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

  // Media Coverage
  async getMediaCoverage(): Promise<MediaCoverage[]> {
    return await db.select().from(mediaCoverage).orderBy(desc(mediaCoverage.date));
  }

  async createMediaCoverage(insert: InsertMediaCoverage): Promise<MediaCoverage> {
    const [result] = await db.insert(mediaCoverage).values(insert).returning();
    return result;
  }

  async updateMediaCoverage(id: number, updates: UpdateMediaCoverageRequest): Promise<MediaCoverage | undefined> {
    const [result] = await db.update(mediaCoverage).set(updates).where(eq(mediaCoverage.id, id)).returning();
    return result;
  }

  async deleteMediaCoverage(id: number): Promise<void> {
    await db.delete(mediaCoverage).where(eq(mediaCoverage.id, id));
  }
}

export class MemStorage implements IStorage {
  private announcements: Map<number, Announcement>;
  private panels: Map<number, Panel>;
  private achievements: Map<number, Achievement>;
  private departments: Map<number, Department>;
  private registrations: Map<number, Registration>;
  private mediaCoverage: Map<number, MediaCoverage>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.announcements = new Map();
    this.panels = new Map();
    this.achievements = new Map();
    this.departments = new Map();
    this.registrations = new Map();
    this.mediaCoverage = new Map();
    this.currentIds = { announcements: 1, panels: 1, achievements: 1, departments: 1, registrations: 1, mediaCoverage: 1 };
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createAnnouncement(insert: InsertAnnouncement): Promise<Announcement> {
    const id = this.currentIds.announcements++;
    const announcement: Announcement = { ...insert, id, createdAt: new Date(), active: insert.active ?? true };
    this.announcements.set(id, announcement);
    return announcement;
  }

  async updateAnnouncement(id: number, updates: UpdateAnnouncementRequest): Promise<Announcement | undefined> {
    if (!this.announcements.has(id)) return undefined;
    const existing = this.announcements.get(id)!;
    const updated = { ...existing, ...updates };
    this.announcements.set(id, updated);
    return updated;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    this.announcements.delete(id);
  }

  // Panels
  async getPanels(type?: 'state' | 'district', district?: string): Promise<Panel[]> {
    let results = Array.from(this.panels.values());
    if (type === 'state') {
      results = results.filter(p => p.isStateLevel);
    } else if (type === 'district') {
      results = results.filter(p => !p.isStateLevel);
      if (district) {
        results = results.filter(p => p.district === district);
      }
    }
    return results.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }

  async createPanel(insert: InsertPanel): Promise<Panel> {
    const id = this.currentIds.panels++;
    const panel: Panel = {
      ...insert,
      id,
      priority: id,
      district: insert.district ?? null,
      imageUrl: insert.imageUrl ?? null,
      phone: insert.phone ?? null,
      category: insert.category ?? null,
      isStateLevel: insert.isStateLevel ?? false,
      active: insert.active ?? true
    };
    this.panels.set(id, panel);
    return panel;
  }

  async updatePanel(id: number, updates: UpdatePanelRequest): Promise<Panel | undefined> {
    if (!this.panels.has(id)) return undefined;
    const existing = this.panels.get(id)!;
    const updated = { ...existing, ...updates };
    this.panels.set(id, updated);
    return updated;
  }

  async deletePanel(id: number): Promise<void> {
    this.panels.delete(id);
  }

  // Achievements
  async getAchievements(category?: string): Promise<Achievement[]> {
    let results = Array.from(this.achievements.values());
    if (category) {
      results = results.filter(a => a.category === category);
    }
    return results.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  async createAchievement(insert: InsertAchievement): Promise<Achievement> {
    const id = this.currentIds.achievements++;
    const achievement: Achievement = {
      ...insert,
      id,
      date: insert.date ?? null,
      imageUrl: insert.imageUrl ?? null,
      category: insert.category ?? 'association',
      active: insert.active ?? true
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async updateAchievement(id: number, updates: UpdateAchievementRequest): Promise<Achievement | undefined> {
    if (!this.achievements.has(id)) return undefined;
    const existing = this.achievements.get(id)!;
    const updated = { ...existing, ...updates };
    this.achievements.set(id, updated);
    return updated;
  }

  async deleteAchievement(id: number): Promise<void> {
    this.achievements.delete(id);
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async updateDepartment(id: number, updates: UpdateDepartmentRequest): Promise<Department | undefined> {
    if (!this.departments.has(id)) return undefined;
    const existing = this.departments.get(id)!;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.departments.set(id, updated);
    return updated;
  }

  // Registrations
  async searchRegistrations(params: SearchRegistrationParams): Promise<Registration[]> {
    if (params.tgmcId) {
      return Array.from(this.registrations.values()).filter(r => r.tgmcId === params.tgmcId);
    }
    return [];
  }

  async createRegistration(insert: InsertRegistration): Promise<Registration> {
    const id = this.currentIds.registrations++;
    const registration: Registration = {
      ...insert,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      tgmcId: insert.tgmcId ?? null,
      email: insert.email ?? null,
      address: insert.address ?? null,
      razorpayTxnId: insert.razorpayTxnId ?? null,
      membershipType: insert.membershipType ?? 'single',
      paymentStatus: insert.paymentStatus ?? 'pending',
      registrationSource: insert.registrationSource ?? 'site_contact',
      status: insert.status ?? 'pending_verification',
      notes: insert.notes ?? null,
      phone: insert.phone
    };
    this.registrations.set(id, registration);
    return registration;
  }

  async updateRegistration(id: number, updates: UpdateRegistrationRequest): Promise<Registration | undefined> {
    if (!this.registrations.has(id)) return undefined;
    const existing = this.registrations.get(id)!;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.registrations.set(id, updated);
    return updated;
  }

  async getRegistrations(): Promise<Registration[]> {
    return Array.from(this.registrations.values()).sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  // Media Coverage
  async getMediaCoverage(): Promise<MediaCoverage[]> {
    return Array.from(this.mediaCoverage.values()).sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  async createMediaCoverage(insert: InsertMediaCoverage): Promise<MediaCoverage> {
    const id = this.currentIds.mediaCoverage++;
    const media: MediaCoverage = {
      ...insert,
      id,
      date: insert.date ?? null,
      active: insert.active ?? true
    };
    this.mediaCoverage.set(id, media);
    return media;
  }

  async updateMediaCoverage(id: number, updates: UpdateMediaCoverageRequest): Promise<MediaCoverage | undefined> {
    if (!this.mediaCoverage.has(id)) return undefined;
    const existing = this.mediaCoverage.get(id)!;
    const updated = { ...existing, ...updates };
    this.mediaCoverage.set(id, updated);
    return updated;
  }

  async deleteMediaCoverage(id: number): Promise<void> {
    this.mediaCoverage.delete(id);
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
