import { db } from "./drizzle";
import { users, bowlingBalls, oilPatterns, performanceData, bowlerSpecs, type InsertUser, type User, type InsertBowlingBall, type BowlingBall, type InsertOilPattern, type OilPattern, type InsertPerformanceData, type PerformanceData, type InsertBowlerSpecs, type BowlerSpecs } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { IStorage } from "./storage";
import bcrypt from "bcrypt";

export class DrizzleStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(insertUser.password, saltRounds);
    const result = await db.insert(users).values({ ...insertUser, password: hashedPassword }).returning();
    return result[0];
  }

  async updateUserSubscription(userId: string, subscription: string): Promise<User | undefined> {
    const result = await db.update(users).set({ subscription, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getBowlingBalls(userId: string): Promise<BowlingBall[]> {
    return db.select().from(bowlingBalls).where(eq(bowlingBalls.userId, userId));
  }

  async getBowlingBall(id: string): Promise<BowlingBall | undefined> {
    const result = await db.select().from(bowlingBalls).where(eq(bowlingBalls.id, id));
    return result[0];
  }

  async createBowlingBall(ball: InsertBowlingBall): Promise<BowlingBall> {
    const result = await db.insert(bowlingBalls).values(ball).returning();
    return result[0];
  }

  async updateBowlingBall(id: string, ball: Partial<InsertBowlingBall>): Promise<BowlingBall | undefined> {
    const result = await db.update(bowlingBalls).set(ball).where(eq(bowlingBalls.id, id)).returning();
    return result[0];
  }

  async deleteBowlingBall(id: string): Promise<boolean> {
    const result = await db.delete(bowlingBalls).where(eq(bowlingBalls.id, id)).returning();
    return result.length > 0;
  }

  async getOilPatterns(): Promise<OilPattern[]> {
    return db.select().from(oilPatterns);
  }

  async getOilPattern(id: string): Promise<OilPattern | undefined> {
    const result = await db.select().from(oilPatterns).where(eq(oilPatterns.id, id));
    return result[0];
  }

  async createOilPattern(pattern: InsertOilPattern): Promise<OilPattern> {
    const result = await db.insert(oilPatterns).values(pattern).returning();
    return result[0];
  }

  async getPerformanceData(userId: string): Promise<PerformanceData[]> {
    return db.select().from(performanceData).where(eq(performanceData.userId, userId));
  }

  async createPerformanceData(data: InsertPerformanceData): Promise<PerformanceData> {
    const result = await db.insert(performanceData).values(data).returning();
    return result[0];
  }

  async getBowlerSpecs(userId: string): Promise<BowlerSpecs | undefined> {
    const result = await db.select().from(bowlerSpecs).where(eq(bowlerSpecs.userId, userId));
    return result[0];
  }

  async createOrUpdateBowlerSpecs(specs: InsertBowlerSpecs): Promise<BowlerSpecs> {
    const existing = await this.getBowlerSpecs(specs.userId);
    if (existing) {
      const result = await db.update(bowlerSpecs).set({ ...specs, updatedAt: new Date() }).where(eq(bowlerSpecs.id, existing.id)).returning();
      return result[0];
    } else {
      const result = await db.insert(bowlerSpecs).values(specs).returning();
      return result[0];
    }
  }
}
