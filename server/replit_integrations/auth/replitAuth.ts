import session from "express-session";
import type { Express, RequestHandler } from "express";
import passport from "passport";

import { pool } from "../../db";
import pgSession from "connect-pg-simple";

const PgSession = pgSession(session);

export function getSession() {
  const secret = process.env.SESSION_SECRET || "dev_secret";

  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set. Falling back to MemoryStore (Sessions will not persist).");
    return session({
      secret,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    });
  }

  console.log("Using Postgres Session Store");
  return session({
    store: new PgSession({
      conObject: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      },
    }),
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" // Recommend lax for general navigation
    }
  });
}

export async function setupAuth(app: Express) {
  const { Strategy: LocalStrategy } = await import("passport-local");

  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    // Hardcoded admin for now
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const user = {
        id: 1,
        username: process.env.ADMIN_USERNAME,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true
      };
      return done(null, user);
    }
    return done(null, false, { message: "Invalid credentials" });
  }));

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user: any, done) => done(null, user));

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => res.redirect("/"));
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  return next();
};
