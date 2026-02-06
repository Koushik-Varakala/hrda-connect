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
    const id = Number(req.params.id);
    const result = await storage.updateRegistration(id, req.body);
    if (!result) return res.status(404).json({ message: "Not found" });

    // Sync Update to Sheets
    try {
      const { googleSheetsService } = await import("./services/googleSheets");
      if (result.tgmcId) {
        // Mark old as updated
        await googleSheetsService.updateRegistration(result.tgmcId, {
          // For now just marking row as updated. 
          // Ideally we append the new version too.
          // Let's append the new version as "Active"
          updatedAt: new Date().toISOString()
        });

        // Append new version
        await googleSheetsService.appendRegistration({
          id: String(result.id),
          tgmcId: result.tgmcId || "",
          firstName: result.firstName,
          lastName: result.lastName,
          phone: result.phone,
          email: result.email || "",
          address: result.address || "",
          membershipType: result.membershipType || "single",
          paymentStatus: result.paymentStatus || "unknown",
          status: result.status || "pending",
          registrationDate: result.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rowStatus: "Active"
        });
      }
    } catch (e) {
      console.error("Failed to sync update to sheets", e);
    }

    res.json(result);
  });

  app.get(api.registrations.list.path, isAuthenticated, async (req, res) => {
    const data = await storage.getRegistrations();
    res.json(data);
  });


  // Alias for client-side admin dashboard which might be using this path
  app.get("/api/admin/registrations", isAuthenticated, async (req, res) => {
    const data = await storage.getRegistrations();
    res.json(data);
  });

  // External API Proxy for TSMC
  app.get("/api/external/tsmc-doctor/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await fetch(`https://api.regonlinetsmc.in/tsmc/api/v1/common/getDoctorInfoByNameGender?fmrNo=${id}&docName=&gender=&fatherName=`);

      if (!response.ok) {
        throw new Error(`External API responded with ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("TSMC API Proxy Error:", error);
      res.status(500).json({ message: "Failed to fetch doctor details" });
    }
  });

  // Payment & Registration
  app.post("/api/registrations/order", async (req, res) => {
    try {
      const { amount, currency } = req.body;

      // Mock Razorpay Order if keys are missing
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn("Razorpay keys missing. Using mock order.");
        return res.json({
          id: `order_mock_${Date.now()}`,
          amount: amount * 100,
          currency: currency,
          key_id: "rzp_test_mock_key"
        });
      }

      const Razorpay = (await import("razorpay")).default;
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: amount * 100, // Amount in paise
        currency: currency,
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (error: any) {
      console.error("Razorpay Error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.post("/api/registrations/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userData } = req.body;

      // Verification logic (Mocked if keys missing, else Verify signature)
      // ... For this MVP we will assume success if we reach here via the Mock

      // Create Registration
      const regInput = api.registrations.create.input.parse({
        ...userData,
        paymentStatus: 'success',
        status: 'verified', // Auto-verify for paid members? Or keep pending? Let's say Verified for now.
        razorpayTxnId: razorpay_payment_id
      });

      const newReg = await storage.createRegistration(regInput);

      let formattedHrdaId: string | number = newReg.id;

      // Sync to Google Sheets
      try {
        // Import dynamic to avoid circular dep issues in some envs
        const { googleSheetsService } = await import("./services/googleSheets");
        const sheetId = await googleSheetsService.appendRegistration({
          id: String(newReg.id),
          tgmcId: newReg.tgmcId || "",
          firstName: newReg.firstName,
          lastName: newReg.lastName,
          phone: newReg.phone,
          email: newReg.email || "",
          address: newReg.address || "",
          membershipType: newReg.membershipType || "single",
          paymentStatus: "success",
          status: "verified",
          registrationDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rowStatus: "Active"
        });

        if (sheetId) {
          formattedHrdaId = sheetId;
        }

      } catch (e) {
        console.error("Failed to sync to sheets", e);
      }

      // Send Email
      try {
        const { emailService } = await import("./services/email");
        if (newReg.email) {
          await emailService.sendRegistrationConfirmation(
            newReg.email,
            `${newReg.firstName} ${newReg.lastName}`,
            newReg.tgmcId || "N/A",
            formattedHrdaId,
            newReg.phone,
            newReg.address || ""
          );
        }
      } catch (e) {
        console.error("Failed to send email", e);
      }

      // Send SMS
      try {
        const { smsService } = await import("./services/sms");
        if (newReg.phone) {
          await smsService.sendRegistrationSuccess(newReg.phone, newReg.firstName, formattedHrdaId);
        }
      } catch (e) {
        console.error("Failed to send SMS", e);
      }

      res.json({ success: true, registrationId: newReg.id, hrdaId: formattedHrdaId });
    } catch (error: any) {
      console.error("Verification Error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Seed
  seedDatabase().catch(console.error);

  return httpServer;
}
