import type { Express } from "express";
import { Router } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertBowlingBallSchema,
  insertOilPatternSchema,
  insertPerformanceDataSchema,
  insertBowlerSpecsSchema,
  insertUserSchema,
  type BowlingBall,
  type OilPattern,
  type BowlerSpecs,
} from "../shared/schema";
import { hashPassword, comparePassword, generateToken } from "./auth";
import { authMiddleware, type AuthRequest } from "./middleware";

// Ball recommendation helper function
function calculateMatchScore(
  ball: BowlingBall,
  pattern: OilPattern,
  specs: BowlerSpecs,
): { matchScore: number; reason: string } {
  // ... (same as before)
  let score = 100;
  const reasons: string[] = [];

  // Oil Pattern Length vs. Hook Potential
  const patternLength = pattern.length;
  if (patternLength >= 42) {
    // Long pattern
    if (ball.hookPotential === "low") {
      score -= 30;
      reasons.push("Low hook on a long pattern is not ideal.");
    } else if (ball.hookPotential === "medium") {
      score -= 10;
      reasons.push(
        "Medium hook is acceptable, but high hook is preferred on long patterns.",
      );
    }
  } else if (patternLength <= 36) {
    // Short pattern
    if (ball.hookPotential === "high") {
      score -= 25;
      reasons.push("High hook on a short pattern can be unpredictable.");
    } else if (ball.hookPotential === "medium") {
      score -= 10;
      reasons.push(
        "Medium hook is usable, but low hook is often better on short patterns.",
      );
    }
  }

  // Oil Volume vs. Coverstock Type
  const oilVolume = parseFloat(String(pattern.volume));
  if (oilVolume > 25) {
    // Heavy oil
    if (ball.coverstockType === "plastic") {
      score -= 50;
      reasons.push("Plastic balls are unsuitable for heavy oil.");
    } else if (ball.coverstockType === "urethane") {
      score -= 20;
      reasons.push("Urethane may struggle on very heavy oil.");
    }
  } else if (oilVolume < 20) {
    // Light oil
    if (ball.coverstockType === "reactive" && ball.surface.includes("Dull")) {
      score -= 20;
      reasons.push(
        "A dull reactive ball might read the lane too early on light oil.",
      );
    }
  }

  // Bowler's Rev Rate vs. Core Type
  if (specs.revRate > 400) {
    // High rev rate
    if (ball.coreType === "asymmetrical") {
      score -= 10;
      reasons.push(
        "High-rev players might find asymmetrical cores too aggressive.",
      );
    }
  } else if (specs.revRate < 300) {
    // Low rev rate
    if (ball.coreType === "symmetrical" && ball.hookPotential === "low") {
      score -= 20;
      reasons.push("Low-rev players may need a stronger core to generate hook.");
    }
  }

  // Bowler's Speed vs. Hook Potential
  if (specs.speed > 18) {
    // High speed
    if (ball.hookPotential === "low") {
      score -= 25;
      reasons.push("High-speed players need more hook potential.");
    }
  } else if (specs.speed < 16) {
    // Low speed
    if (ball.hookPotential === "high") {
      score -= 15;
      reasons.push("Low-speed players might find high hook balls over-reactive.");
    }
  }

  // Playing Style vs. Ball Reaction
  if (specs.playingStyle === "stroker" && ball.hookPotential === "high") {
    score -= 10;
    reasons.push(
      "Strokers often prefer a more controlled reaction than high-hook balls provide.",
    );
  }
  if (specs.playingStyle === "cranker" && ball.hookPotential === "low") {
    score -= 20;
    reasons.push(
      "Crankers usually need more hook potential than this ball offers.",
    );
  }

  const reason =
    reasons.length > 0
      ? reasons.join(" ")
      : "A solid choice for this pattern and your style.";

  return { matchScore: Math.max(0, score), reason };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const protectedRouter = Router();
  protectedRouter.use(authMiddleware);

  // Bowling Balls routes
  protectedRouter.get("/balls", async (req: AuthRequest, res) => {
    try {
      const balls = await storage.getBowlingBalls(req.userId!);
      res.json(balls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bowling balls" });
    }
  });

  protectedRouter.post("/balls", async (req: AuthRequest, res) => {
    try {
      const ballData = insertBowlingBallSchema.parse({ ...req.body, userId: req.userId });
      const ball = await storage.createBowlingBall(ballData);
      res.json(ball);
    } catch (error) {
      res.status(400).json({ message: "Invalid ball data" });
    }
  });

  protectedRouter.put("/balls/:id", async (req: AuthRequest, res) => {
    try {
      const updates = req.body;
      const ball = await storage.updateBowlingBall(req.params.id, updates);
      if (!ball) {
        return res.status(404).json({ message: "Ball not found" });
      }
      res.json(ball);
    } catch (error) {
      res.status(400).json({ message: "Failed to update ball" });
    }
  });

  protectedRouter.delete("/balls/:id", async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteBowlingBall(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Ball not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ball" });
    }
  });

  // Oil Patterns routes
  protectedRouter.get("/patterns", async (req: AuthRequest, res) => {
    try {
      const patterns = await storage.getOilPatterns();
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch oil patterns" });
    }
  });

  protectedRouter.post("/patterns", async (req: AuthRequest, res) => {
    try {
      const patternData = insertOilPatternSchema.parse(req.body);
      const pattern = await storage.createOilPattern(patternData);
      res.json(pattern);
    } catch (error) {
      res.status(400).json({ message: "Invalid pattern data" });
    }
  });

  // Performance Data routes
  protectedRouter.get("/performance", async (req: AuthRequest, res) => {
    try {
      const performance = await storage.getPerformanceData(req.userId!);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });

  protectedRouter.post("/performance", async (req: AuthRequest, res) => {
    try {
      const performanceData = insertPerformanceDataSchema.parse({ ...req.body, userId: req.userId });
      const data = await storage.createPerformanceData(performanceData);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: "Invalid performance data" });
    }
  });

  // Bowler Specs routes
  protectedRouter.get("/bowler-specs", async (req: AuthRequest, res) => {
    try {
      const specs = await storage.getBowlerSpecs(req.userId!);
      res.json(specs || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bowler specs" });
    }
  });

  protectedRouter.post("/bowler-specs", async (req: AuthRequest, res) => {
    try {
      const specsData = insertBowlerSpecsSchema.parse({ ...req.body, userId: req.userId });
      const specs = await storage.createOrUpdateBowlerSpecs(specsData);
      res.json(specs);
    } catch (error) {
      res.status(400).json({ message: "Invalid bowler specs data" });
    }
  });

  // Ball recommendation endpoint
  protectedRouter.post("/recommend-balls", async (req: AuthRequest, res) => {
    try {
      const { patternId, bowlerSpecs } = req.body;

      if (!patternId || !bowlerSpecs) {
        return res.status(400).json({ message: "Pattern ID and bowler specs are required" });
      }

      const pattern = await storage.getOilPattern(patternId);
      if (!pattern) {
        return res.status(404).json({ message: "Oil pattern not found" });
      }

      const userBalls = await storage.getBowlingBalls(req.userId!);
      if (!userBalls || userBalls.length === 0) {
        return res.status(404).json({ message: "No bowling balls found for this user." });
      }

      const recommendations = userBalls.map((ball) => {
        const { matchScore, reason } = calculateMatchScore(
          ball,
          pattern,
          bowlerSpecs,
        );
        return {
          ...ball,
          matchScore,
          reason,
        };
      });

      recommendations.sort((a, b) => b.matchScore - a.matchScore);

      res.json(recommendations);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        return res
          .status(500)
          .json({
            message: "Failed to generate recommendations",
            error: error.message,
          });
      }
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  protectedRouter.get("/auth/me", async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.use('/api', protectedRouter);

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({ username, password, hashedPassword });

      const token = generateToken(user.id);
      res.json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);

      const user = await storage.getUserByUsername(username);
      if (!user || !user.hashedPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordMatch = await comparePassword(password, user.hashedPassword);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id);
      res.json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
