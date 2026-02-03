import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

// Seed Data Function
async function seedDatabase() {
  // Check if we have data
  const announcements = await storage.getAnnouncements();
  if (announcements.length === 0) {
    await storage.createAnnouncement({
      title: "HRDA Membership Drive 2026",
      content: "Join HRDA today to support healthcare reforms in Telangana. Lifetime membership available.",
      date: new Date().toISOString(),
      active: true,
    });
    await storage.createAnnouncement({
      title: "Annual General Meeting",
      content: "The AGM will be held on March 15th at the State Office. All members are requested to attend.",
      date: new Date().toISOString(),
      active: true,
    });
  }

  const panels = await storage.getPanels();
  if (panels.length === 0) {
    await storage.createPanel({
      name: "Dr. Srinivas",
      role: "President",
      isStateLevel: true,
      imageUrl: "https://placehold.co/400",
      phone: "+91 9876543210",
      active: true,
    });
    await storage.createPanel({
      name: "Dr. Ravi",
      role: "Secretary",
      isStateLevel: true,
      imageUrl: "https://placehold.co/400",
      phone: "+91 9876543211",
      active: true,
    });
    await storage.createPanel({
      name: "Dr. Priya",
      role: "District President",
      district: "Hyderabad",
      isStateLevel: false,
      imageUrl: "https://placehold.co/400",
      phone: "+91 9876543212",
      active: true,
    });
  }

  const registrations = await storage.getRegistrations();
  if (registrations.length === 0) {
    await storage.createRegistration({
      tgmcId: "TGMC12345",
      firstName: "John",
      lastName: "Doe",
      phone: "9999999999",
      email: "john@example.com",
      status: "verified",
      paymentStatus: "success",
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // === API ROUTES ===

  // Announcements
  app.get(api.announcements.list.path, async (req, res) => {
    const data = await storage.getAnnouncements();
    res.json(data);
  });

  app.post(api.announcements.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.announcements.create.input.parse(req.body);
      const result = await storage.createAnnouncement(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err);
      else throw err;
    }
  });

  app.put(api.announcements.update.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const input = api.announcements.update.input.parse(req.body);
    const result = await storage.updateAnnouncement(id, input);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json(result);
  });

  app.delete(api.announcements.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteAnnouncement(Number(req.params.id));
    res.status(204).end();
  });

  // Panels
  app.get(api.panels.list.path, async (req, res) => {
    // Parse query manually since express doesn't enforce schema on req.query
    const type = req.query.type as 'state' | 'district' | undefined;
    const district = req.query.district as string | undefined;
    const data = await storage.getPanels(type, district);
    res.json(data);
  });

  app.post(api.panels.create.path, isAuthenticated, async (req, res) => {
    const input = api.panels.create.input.parse(req.body);
    const result = await storage.createPanel(input);
    res.status(201).json(result);
  });

  app.put(api.panels.update.path, isAuthenticated, async (req, res) => {
    const result = await storage.updatePanel(Number(req.params.id), req.body);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json(result);
  });

  app.delete(api.panels.delete.path, isAuthenticated, async (req, res) => {
    await storage.deletePanel(Number(req.params.id));
    res.status(204).end();
  });

  // Achievements
  app.get(api.achievements.list.path, async (req, res) => {
    const data = await storage.getAchievements();
    res.json(data);
  });

  app.post(api.achievements.create.path, isAuthenticated, async (req, res) => {
    const input = api.achievements.create.input.parse(req.body);
    const result = await storage.createAchievement(input);
    res.status(201).json(result);
  });

  app.put(api.achievements.update.path, isAuthenticated, async (req, res) => {
    const result = await storage.updateAchievement(Number(req.params.id), req.body);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json(result);
  });

  app.delete(api.achievements.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteAchievement(Number(req.params.id));
    res.status(204).end();
  });

  // Departments
  app.get(api.departments.list.path, async (req, res) => {
    const data = await storage.getDepartments();
    res.json(data);
  });

  app.put(api.departments.update.path, isAuthenticated, async (req, res) => {
    const result = await storage.updateDepartment(Number(req.params.id), req.body);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json(result);
  });

  // Registrations
  app.get(api.registrations.search.path, async (req, res) => {
    const tgmcId = req.query.tgmcId as string;
    const data = await storage.searchRegistrations({ tgmcId });
    if (data.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(data);
  });

  app.post(api.registrations.create.path, async (req, res) => {
    const input = api.registrations.create.input.parse(req.body);
    const result = await storage.createRegistration(input);
    res.status(201).json(result);
  });

  app.put(api.registrations.update.path, async (req, res) => {
    const result = await storage.updateRegistration(Number(req.params.id), req.body);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json(result);
  });

  app.get(api.registrations.list.path, isAuthenticated, async (req, res) => {
    const data = await storage.getRegistrations();
    res.json(data);
  });
  
  // Seed
  seedDatabase().catch(console.error);

  return httpServer;
}
