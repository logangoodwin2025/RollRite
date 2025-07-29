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
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bowlingBalls: Map<string, BowlingBall>;
  private oilPatterns: Map<string, OilPattern>;
  private performanceData: Map<string, PerformanceData>;
  private bowlerSpecs: Map<string, BowlerSpecs>;

  constructor() {
    this.users = new Map();
    this.bowlingBalls = new Map();
    this.oilPatterns = new Map();
    this.performanceData = new Map();
    this.bowlerSpecs = new Map();
    
    // Initialize with default oil patterns
    this.initializeDefaultPatterns();
  }

  private initializeDefaultPatterns() {
    const defaultPatterns: OilPattern[] = [
      {
        id: "pattern-1",
        name: "PBA Shark",
        category: "pba",
        length: 39,
        volume: "23.2",
        ratio: "3.06:1",
        difficulty: "medium",
        description: "A medium-length pattern with moderate volume",
        isCustom: "false",
        createdBy: null,
      },
      {
        id: "pattern-2",
        name: "PBA Chameleon",
        category: "pba",
        length: 35,
        volume: "18.8",
        ratio: "4.84:1",
        difficulty: "hard",
        description: "A shorter, lower volume pattern that rewards accuracy",
        isCustom: "false",
        createdBy: null,
      },
      {
        id: "pattern-3",
        name: "WTBA Beijing",
        category: "wtba",
        length: 37,
        volume: "21.5",
        ratio: "2.92:1",
        difficulty: "medium",
        description: "Used in international competition",
        isCustom: "false",
        createdBy: null,
      },
      {
        id: "pattern-4",
        name: "Kegel Main Street",
        category: "kegel",
        length: 40,
        volume: "28.1",
        ratio: "2.1:1",
        difficulty: "easy",
        description: "A forgiving house shot pattern",
        isCustom: "false",
        createdBy: null,
      },
    ];

    defaultPatterns.forEach(pattern => {
      this.oilPatterns.set(pattern.id, pattern);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBowlingBalls(userId: string): Promise<BowlingBall[]> {
    return Array.from(this.bowlingBalls.values()).filter(
      ball => ball.userId === userId
    );
  }

  async getBowlingBall(id: string): Promise<BowlingBall | undefined> {
    return this.bowlingBalls.get(id);
  }

  async createBowlingBall(ball: InsertBowlingBall): Promise<BowlingBall> {
    const id = randomUUID();
    const newBall: BowlingBall = { 
      ...ball, 
      id,
      createdAt: new Date()
    };
    this.bowlingBalls.set(id, newBall);
    return newBall;
  }

  async updateBowlingBall(id: string, updates: Partial<InsertBowlingBall>): Promise<BowlingBall | undefined> {
    const existingBall = this.bowlingBalls.get(id);
    if (!existingBall) return undefined;
    
    const updatedBall = { ...existingBall, ...updates };
    this.bowlingBalls.set(id, updatedBall);
    return updatedBall;
  }

  async deleteBowlingBall(id: string): Promise<boolean> {
    return this.bowlingBalls.delete(id);
  }

  async getOilPatterns(): Promise<OilPattern[]> {
    return Array.from(this.oilPatterns.values());
  }

  async getOilPattern(id: string): Promise<OilPattern | undefined> {
    return this.oilPatterns.get(id);
  }

  async createOilPattern(pattern: InsertOilPattern): Promise<OilPattern> {
    const id = randomUUID();
    const newPattern: OilPattern = { ...pattern, id };
    this.oilPatterns.set(id, newPattern);
    return newPattern;
  }

  async getPerformanceData(userId: string): Promise<PerformanceData[]> {
    return Array.from(this.performanceData.values()).filter(
      data => data.userId === userId
    );
  }

  async createPerformanceData(data: InsertPerformanceData): Promise<PerformanceData> {
    const id = randomUUID();
    const newData: PerformanceData = { 
      ...data, 
      id,
      createdAt: new Date()
    };
    this.performanceData.set(id, newData);
    return newData;
  }

  async getBowlerSpecs(userId: string): Promise<BowlerSpecs | undefined> {
    return Array.from(this.bowlerSpecs.values()).find(
      specs => specs.userId === userId
    );
  }

  async createOrUpdateBowlerSpecs(specs: InsertBowlerSpecs): Promise<BowlerSpecs> {
    const existing = await this.getBowlerSpecs(specs.userId);
    
    if (existing) {
      const updated = { ...existing, ...specs, updatedAt: new Date() };
      this.bowlerSpecs.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newSpecs: BowlerSpecs = { 
        ...specs, 
        id,
        updatedAt: new Date()
      };
      this.bowlerSpecs.set(id, newSpecs);
      return newSpecs;
    }
  }
}

export const storage = new MemStorage();
