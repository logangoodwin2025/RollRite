import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBowlingBallSchema,
  insertOilPatternSchema,
  insertPerformanceDataSchema,
  insertBowlerSpecsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bowling Balls routes
  app.get("/api/balls/:userId", async (req, res) => {
    try {
      const balls = await storage.getBowlingBalls(req.params.userId);
      res.json(balls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bowling balls" });
    }
  });

  app.post("/api/balls", async (req, res) => {
    try {
      const ballData = insertBowlingBallSchema.parse(req.body);
      const ball = await storage.createBowlingBall(ballData);
      res.json(ball);
    } catch (error) {
      res.status(400).json({ message: "Invalid ball data" });
    }
  });

  app.put("/api/balls/:id", async (req, res) => {
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

  app.delete("/api/balls/:id", async (req, res) => {
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
  app.get("/api/patterns", async (req, res) => {
    try {
      const patterns = await storage.getOilPatterns();
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch oil patterns" });
    }
  });

  app.post("/api/patterns", async (req, res) => {
    try {
      const patternData = insertOilPatternSchema.parse(req.body);
      const pattern = await storage.createOilPattern(patternData);
      res.json(pattern);
    } catch (error) {
      res.status(400).json({ message: "Invalid pattern data" });
    }
  });

  // Performance Data routes
  app.get("/api/performance/:userId", async (req, res) => {
    try {
      const performance = await storage.getPerformanceData(req.params.userId);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });

  app.post("/api/performance", async (req, res) => {
    try {
      const performanceData = insertPerformanceDataSchema.parse(req.body);
      const data = await storage.createPerformanceData(performanceData);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: "Invalid performance data" });
    }
  });

  // Bowler Specs routes
  app.get("/api/bowler-specs/:userId", async (req, res) => {
    try {
      const specs = await storage.getBowlerSpecs(req.params.userId);
      res.json(specs || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bowler specs" });
    }
  });

  app.post("/api/bowler-specs", async (req, res) => {
    try {
      const specsData = insertBowlerSpecsSchema.parse(req.body);
      const specs = await storage.createOrUpdateBowlerSpecs(specsData);
      res.json(specs);
    } catch (error) {
      res.status(400).json({ message: "Invalid bowler specs data" });
    }
  });

  // Ball recommendation endpoint
  app.post("/api/recommend-balls", async (req, res) => {
    try {
      const { patternId, bowlerSpecs } = req.body;
      
      if (!patternId || !bowlerSpecs) {
        return res.status(400).json({ message: "Pattern ID and bowler specs are required" });
      }

      const pattern = await storage.getOilPattern(patternId);
      if (!pattern) {
        return res.status(404).json({ message: "Oil pattern not found" });
      }

      // Simplified ball recommendation algorithm
      const recommendations = [
        {
          name: "Storm Phaze II",
          brand: "Storm",
          matchScore: 94,
          hookPotential: "high",
          suggestedSurface: "2000 Abralon",
          entryAngle: 4.8,
          reason: "Excellent for medium-heavy oil with high rev rate players"
        },
        {
          name: "Hammer Obsession",
          brand: "Hammer",
          matchScore: 87,
          hookPotential: "medium-high",
          suggestedSurface: "1500 Grit",
          entryAngle: 4.2,
          reason: "Solid reactive ball great for consistent reaction"
        },
        {
          name: "Roto Grip Idol",
          brand: "Roto Grip",
          matchScore: 82,
          hookPotential: "medium",
          suggestedSurface: "3000 Abralon",
          entryAngle: 3.9,
          reason: "Versatile ball that works on various conditions"
        }
      ];

      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
