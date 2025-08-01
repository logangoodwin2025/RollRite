import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
});

export const bowlingBalls = pgTable("bowling_balls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  weight: integer("weight").notNull(),
  coreType: text("core_type").notNull(), // "symmetrical" | "asymmetrical"
  coverstockType: text("coverstock_type").notNull(), // "reactive", "urethane", "plastic"
  surface: text("surface").notNull(), // "2000 Abralon", "1500 Grit", etc.
  drilling: text("drilling").notNull(), // "Pin Up 4.5", "Pin Down 3.5", etc.
  gamesPlayed: integer("games_played").notNull().default(0),
  averageScore: decimal("average_score", { precision: 5, scale: 2 }),
  hookPotential: text("hook_potential").notNull(), // "low", "medium", "high"
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const oilPatterns = pgTable("oil_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // "pba", "wtba", "kegel", "custom"
  length: integer("length").notNull(), // in feet
  volume: decimal("volume", { precision: 4, scale: 1 }).notNull(), // in mL
  ratio: text("ratio").notNull(), // "3.06:1"
  difficulty: text("difficulty").notNull(), // "easy", "medium", "hard"
  description: text("description"),
  isCustom: text("is_custom").notNull().default("false"), // "true" | "false"
  createdBy: varchar("created_by"),
});

export const performanceData = pgTable("performance_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  ballId: varchar("ball_id").notNull(),
  patternId: varchar("pattern_id").notNull(),
  venue: text("venue").notNull(),
  score: integer("score").notNull(),
  carryPercentage: decimal("carry_percentage", { precision: 5, scale: 2 }).notNull(),
  entryAngle: decimal("entry_angle", { precision: 4, scale: 2 }),
  gameDate: timestamp("game_date").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const bowlerSpecs = pgTable("bowler_specs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  speed: integer("speed").notNull(), // mph
  revRate: integer("rev_rate").notNull(), // rpm
  playingStyle: text("playing_style").notNull(), // "stroker", "tweener", "cranker", "power_player"
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users, {
  password: z.string(),
}).pick({
  username: true,
  password: true,
});

export const insertBowlingBallSchema = createInsertSchema(bowlingBalls).omit({
  id: true,
  createdAt: true,
});

export const insertOilPatternSchema = createInsertSchema(oilPatterns).omit({
  id: true,
});

export const insertPerformanceDataSchema = createInsertSchema(performanceData).omit({
  id: true,
  createdAt: true,
});

export const insertBowlerSpecsSchema = createInsertSchema(bowlerSpecs).omit({
  id: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBowlingBall = z.infer<typeof insertBowlingBallSchema>;
export type BowlingBall = typeof bowlingBalls.$inferSelect;
export type InsertOilPattern = z.infer<typeof insertOilPatternSchema>;
export type OilPattern = typeof oilPatterns.$inferSelect;
export type InsertPerformanceData = z.infer<typeof insertPerformanceDataSchema>;
export type PerformanceData = typeof performanceData.$inferSelect;
export type InsertBowlerSpecs = z.infer<typeof insertBowlerSpecsSchema>;
export type BowlerSpecs = typeof bowlerSpecs.$inferSelect;
