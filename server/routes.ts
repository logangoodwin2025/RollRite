import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertBowlingBallSchema,
  insertOilPatternSchema,
  insertPerformanceDataSchema,
  insertBowlerSpecsSchema,
  type BowlingBall,
  type OilPattern,
  type BowlerSpecs,
} from "@shared/schema";

// Ball recommendation helper function
function calculateMatchScore(
  ball: BowlingBall,
  pattern: OilPattern,
  specs: BowlerSpecs,
): { matchScore: number; reason: string } {
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
  const oilVolume = parseFloat(pattern.volume);
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
      const { patternId, bowlerSpecs, userId } = req.body;

      if (!patternId || !bowlerSpecs || !userId) {
        return res
          .status(400)
          .json({
            message: "Pattern ID, bowler specs, and user ID are required",
          });
      }

      const pattern = await storage.getOilPattern(patternId);
      if (!pattern) {
        return res.status(404).json({ message: "Oil pattern not found" });
      }

      const userBalls = await storage.getBowlingBalls(userId);
      if (!userBalls || userBalls.length === 0) {
        return res
          .status(404)
          .json({ message: "No bowling balls found for this user." });
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

  const httpServer = createServer(app);
  return httpServer;
}
