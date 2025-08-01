import {
  type User,
  type InsertUser,
  type BowlingBall,
  type InsertBowlingBall,
  type OilPattern,
  type InsertOilPattern,
  type PerformanceData,
  type InsertPerformanceData,
  type BowlerSpecs,
  type InsertBowlerSpecs,
  users,
  bowlingBalls,
  oilPatterns,
  performanceData,
  bowlerSpecs
} from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getBowlingBalls(userId: string): Promise<BowlingBall[]>;
  getBowlingBall(id: string): Promise<BowlingBall | undefined>;
  createBowlingBall(ball: InsertBowlingBall): Promise<BowlingBall>;
  updateBowlingBall(id: string, ball: Partial<InsertBowlingBall>): Promise<BowlingBall | undefined>;
  deleteBowlingBall(id: string): Promise<boolean>;

  getOilPatterns(): Promise<OilPattern[]>;
  getOilPattern(id: string): Promise<OilPattern | undefined>;
  createOilPattern(pattern: InsertOilPattern): Promise<OilPattern>;

  getPerformanceData(userId: string): Promise<PerformanceData[]>;
  createPerformanceData(data: InsertPerformanceData): Promise<PerformanceData>;

  getBowlerSpecs(userId: string): Promise<BowlerSpecs | undefined>;
  createOrUpdateBowlerSpecs(specs: InsertBowlerSpecs): Promise<BowlerSpecs>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.username, username) });
  }

  async createUser(insertUser: InsertUser & { hashedPassword: string }): Promise<User> {
    const { password, ...rest } = insertUser;
    const [user] = await db.insert(users).values(rest).returning();
    return user;
  }

  async getBowlingBalls(userId: string): Promise<BowlingBall[]> {
    return db.query.bowlingBalls.findMany({ where: eq(bowlingBalls.userId, userId) });
  }

  async getBowlingBall(id: string): Promise<BowlingBall | undefined> {
    return db.query.bowlingBalls.findFirst({ where: eq(bowlingBalls.id, id) });
  }

  async createBowlingBall(ball: InsertBowlingBall): Promise<BowlingBall> {
    const [newBall] = await db.insert(bowlingBalls).values(ball).returning();
    return newBall;
  }

  async updateBowlingBall(id: string, ball: Partial<InsertBowlingBall>): Promise<BowlingBall | undefined> {
    const [updatedBall] = await db.update(bowlingBalls).set(ball).where(eq(bowlingBalls.id, id)).returning();
    return updatedBall;
  }

  async deleteBowlingBall(id: string): Promise<boolean> {
    const res = await db.delete(bowlingBalls).where(eq(bowlingBalls.id, id));
    return res.rowCount > 0;
  }

  async getOilPatterns(): Promise<OilPattern[]> {
    return db.query.oilPatterns.findMany();
  }

  async getOilPattern(id: string): Promise<OilPattern | undefined> {
    return db.query.oilPatterns.findFirst({ where: eq(oilPatterns.id, id) });
  }

  async createOilPattern(pattern: InsertOilPattern): Promise<OilPattern> {
    const [newPattern] = await db.insert(oilPatterns).values(pattern).returning();
    return newPattern;
  }

  async getPerformanceData(userId: string): Promise<PerformanceData[]> {
    return db.query.performanceData.findMany({ where: eq(performanceData.userId, userId) });
  }

  async createPerformanceData(data: InsertPerformanceData): Promise<PerformanceData> {
    const [newData] = await db.insert(performanceData).values(data).returning();
    return newData;
  }

  async getBowlerSpecs(userId: string): Promise<BowlerSpecs | undefined> {
    return db.query.bowlerSpecs.findFirst({ where: eq(bowlerSpecs.userId, userId) });
  }

  async createOrUpdateBowlerSpecs(specs: InsertBowlerSpecs): Promise<BowlerSpecs> {
    const [updatedSpecs] = await db.insert(bowlerSpecs).values(specs).onConflictDoUpdate({
      target: bowlerSpecs.userId,
      set: specs,
    }).returning();
    return updatedSpecs;
  }
}

export const storage = new DbStorage();
