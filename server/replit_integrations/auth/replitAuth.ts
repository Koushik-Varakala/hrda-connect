import session from "express-session";
import type { Express, RequestHandler } from "express";
import passport from "passport";

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // default memory store
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
