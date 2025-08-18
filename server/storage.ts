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
  type InsertBowlerSpecs
} from "@shared/schema";
import { DrizzleStorage } from "./drizzle-storage";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(userId: string, subscription: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  
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

export const storage = new DrizzleStorage();
