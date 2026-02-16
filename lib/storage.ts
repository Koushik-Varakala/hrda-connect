import { db } from "./db";
import {
    announcements, panels, achievements, departments, registrations, mediaCoverage,
    type Announcement, type InsertAnnouncement, type UpdateAnnouncementRequest,
    type Panel, type InsertPanel, type UpdatePanelRequest,
    type Achievement, type InsertAchievement, type UpdateAchievementRequest,
    type MediaCoverage, type InsertMediaCoverage, type UpdateMediaCoverageRequest,
    type Department, type UpdateDepartmentRequest,
    type Registration, type InsertRegistration, type UpdateRegistrationRequest, type SearchRegistrationParams,
    electionDocuments, type ElectionDocument, type InsertElectionDocument,
    galleryPhotos, type GalleryPhoto, type InsertGalleryPhoto
} from "@shared/schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export interface IStorage {
    // Announcements
    getAnnouncements(): Promise<Announcement[]>;
    createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
    updateAnnouncement(id: number, updates: UpdateAnnouncementRequest): Promise<Announcement | undefined>;
    deleteAnnouncement(id: number): Promise<void>;

    // Panels
    getPanels(type?: 'state' | 'district', district?: string): Promise<Panel[]>;
    getPanel(id: number): Promise<Panel | undefined>;
    createPanel(panel: InsertPanel): Promise<Panel>;
    updatePanel(id: number, updates: UpdatePanelRequest): Promise<Panel | undefined>;
    deletePanel(id: number): Promise<void>;

    // Achievements
    getAchievements(category?: string): Promise<Achievement[]>;
    getAchievement(id: number): Promise<Achievement | undefined>;
    createAchievement(achievement: InsertAchievement): Promise<Achievement>;
    updateAchievement(id: number, updates: UpdateAchievementRequest): Promise<Achievement | undefined>;
    deleteAchievement(id: number): Promise<void>;

    // Departments
    getDepartments(): Promise<Department[]>;
    updateDepartment(id: number, updates: UpdateDepartmentRequest): Promise<Department | undefined>;

    // Registrations
    searchRegistrations(params: SearchRegistrationParams): Promise<Registration[]>;
    getRegistration(id: number): Promise<Registration | undefined>;
    getRegistrationByPhone(phone: string): Promise<Registration | undefined>;
    getRegistrationByHrdaId(hrdaId: string): Promise<Registration | undefined>;
    getRegistrationByToken(token: string): Promise<Registration | undefined>;
    createRegistration(registration: InsertRegistration): Promise<Registration>;
    updateRegistration(id: number, updates: UpdateRegistrationRequest): Promise<Registration | undefined>;
    deleteRegistration(id: number): Promise<void>;
    getRegistrations(): Promise<Registration[]>;

    // Media Coverage
    getMediaCoverage(): Promise<MediaCoverage[]>;
    getMediaCoverageById(id: number): Promise<MediaCoverage | undefined>;
    createMediaCoverage(media: InsertMediaCoverage): Promise<MediaCoverage>;
    updateMediaCoverage(id: number, updates: UpdateMediaCoverageRequest): Promise<MediaCoverage | undefined>;
    deleteMediaCoverage(id: number): Promise<void>;

    // Election Documents
    getElectionDocuments(): Promise<ElectionDocument[]>;
    createElectionDocument(doc: InsertElectionDocument): Promise<ElectionDocument>;
    deleteElectionDocument(id: number): Promise<void>;

    // Gallery
    getGalleryPhotos(): Promise<GalleryPhoto[]>;
    getGalleryPhoto(id: number): Promise<GalleryPhoto | undefined>;
    createGalleryPhoto(photo: InsertGalleryPhoto): Promise<GalleryPhoto>;
    deleteGalleryPhoto(id: number): Promise<void>;
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
            // @ts-ignore
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

    async getPanel(id: number): Promise<Panel | undefined> {
        const [result] = await db.select().from(panels).where(eq(panels.id, id));
        return result;
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
            query.where(eq(achievements.category, category));
        }
        return await query.orderBy(desc(achievements.date));
    }

    async getAchievement(id: number): Promise<Achievement | undefined> {
        const [result] = await db.select().from(achievements).where(eq(achievements.id, id));
        return result;
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
        if (params.phone) {
            return await db.select().from(registrations).where(eq(registrations.phone, params.phone));
        }
        return [];
    }

    async getRegistration(id: number): Promise<Registration | undefined> {
        const [registration] = await db.select().from(registrations).where(eq(registrations.id, id));
        return registration;
    }

    async getRegistrationByPhone(phone: string): Promise<Registration | undefined> {
        const [registration] = await db.select().from(registrations).where(eq(registrations.phone, phone));
        return registration;
    }

    async getRegistrationByHrdaId(hrdaId: string): Promise<Registration | undefined> {
        const [registration] = await db.select().from(registrations).where(eq(registrations.hrdaId, hrdaId));
        return registration;
    }

    async getRegistrationByToken(token: string): Promise<Registration | undefined> {
        const [registration] = await db.select().from(registrations).where(eq(registrations.verificationToken, token));
        return registration;
    }

    async createRegistration(insert: InsertRegistration): Promise<Registration> {
        const [result] = await db.insert(registrations).values({
            ...insert,
            verificationToken: randomUUID()
        }).returning();
        return result;
    }

    async updateRegistration(id: number, updates: UpdateRegistrationRequest): Promise<Registration | undefined> {
        const [result] = await db.update(registrations).set(updates).where(eq(registrations.id, id)).returning();
        return result;
    }

    async deleteRegistration(id: number): Promise<void> {
        await db.delete(registrations).where(eq(registrations.id, id));
    }

    async getRegistrations(): Promise<Registration[]> {
        return await db.select().from(registrations).orderBy(desc(registrations.createdAt));
    }

    // Media Coverage
    async getMediaCoverage(): Promise<MediaCoverage[]> {
        return await db.select().from(mediaCoverage).orderBy(desc(mediaCoverage.date));
    }

    async getMediaCoverageById(id: number): Promise<MediaCoverage | undefined> {
        const [result] = await db.select().from(mediaCoverage).where(eq(mediaCoverage.id, id));
        return result;
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

    // Election Documents
    async getElectionDocuments(): Promise<ElectionDocument[]> {
        return await db.select().from(electionDocuments).orderBy(electionDocuments.id);
    }

    async createElectionDocument(insert: InsertElectionDocument): Promise<ElectionDocument> {
        const [result] = await db.insert(electionDocuments).values(insert).returning();
        return result;
    }

    async deleteElectionDocument(id: number): Promise<void> {
        await db.delete(electionDocuments).where(eq(electionDocuments.id, id));
    }

    // Gallery
    async getGalleryPhotos(): Promise<GalleryPhoto[]> {
        return await db.select().from(galleryPhotos).where(eq(galleryPhotos.active, true)).orderBy(desc(galleryPhotos.createdAt));
    }

    async getGalleryPhoto(id: number): Promise<GalleryPhoto | undefined> {
        const [result] = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, id));
        return result;
    }

    async createGalleryPhoto(insert: InsertGalleryPhoto): Promise<GalleryPhoto> {
        const [result] = await db.insert(galleryPhotos).values(insert).returning();
        return result;
    }

    async deleteGalleryPhoto(id: number): Promise<void> {
        await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
    }
}

export const storage = new DatabaseStorage();
