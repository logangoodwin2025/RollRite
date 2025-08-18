import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

export function setupAuth(app: Express) {
  // We need to use a session store to keep track of the user's session.
  // For now, we'll use an in-memory store. In a production environment,
  // you would want to use a persistent store like Redis or a database.
  const store = new (MemoryStore(session))({
    checkPeriod: 86400000, // prune expired entries every 24h
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "a-secret-key",
      resave: false,
      saveUninitialized: false,
      store,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport Local Strategy
  // This is the core of the authentication system. It defines how to
  // verify a user's credentials.
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  // Passport serialization and deserialization
  // These functions determine what user information to store in the session.
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication routes
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ message: "Logged in successfully", user: req.user });
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // This route can be used by the frontend to check if the user is
  // authenticated.
  app.get("/api/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "You are not authenticated" });
    }
  });
}

// Middleware to check if the user is authenticated
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "You are not authorized to view this page" });
}

// Middleware to check if the user is an admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user as any).role === "admin") {
    return next();
  }
  res.status(403).json({ message: "You are not authorized to perform this action" });
}

// Middleware to check if the user has a premium subscription
export function isSubscribed(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user as any).subscription === "premium") {
    return next();
  }
  res.status(403).json({ message: "You need a premium subscription to access this feature" });
}
