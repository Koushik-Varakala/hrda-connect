import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

class MemAuthStorage implements IAuthStorage {
  private users: Map<string, User> = new Map();

  constructor() {
    this.users.set("1", {
      id: "1",
      username: "dev",
      firstName: "Admin",
      lastName: "User",
      email: "admin@hrda.in",
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as User);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(String(id));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || "1"; // Fallback
    const user = { ...userData, id, createdAt: new Date() } as User;
    this.users.set(id, user);
    return user;
  }
}

console.log("AuthStorage: DATABASE_URL is", process.env.DATABASE_URL ? "SET" : "NOT SET");
export const authStorage = (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") ? new AuthStorage() : new MemAuthStorage();
