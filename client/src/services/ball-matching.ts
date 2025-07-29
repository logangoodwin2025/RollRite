import type { OilPattern, BowlerSpecs } from "@shared/schema";

export interface BallRecommendation {
  name: string;
  brand: string;
  matchScore: number;
  hookPotential: string;
  suggestedSurface: string;
  entryAngle: number;
  reason: string;
}

export interface BowlerSpecsInput {
  speed: number;
  revRate: number;
  playingStyle: string;
}

export class BallMatchingService {
  static generateRecommendations(
    pattern: OilPattern, 
    bowlerSpecs: BowlerSpecsInput
  ): BallRecommendation[] {
    const recommendations: BallRecommendation[] = [];
    
    // Simple algorithm based on pattern characteristics and bowler specs
    const patternLength = pattern.length;
    const patternVolume = parseFloat(pattern.volume);
    const difficulty = pattern.difficulty;
    
    // Base recommendations with different characteristics
    const baseBalls = [
      {
        name: "Storm Phaze II",
        brand: "Storm",
        hookPotential: "high",
        baseScore: 85,
        preferredConditions: { minLength: 35, maxLength: 42, minVolume: 20, maxVolume: 30 },
        speedRange: { min: 14, max: 18 },
        revRange: { min: 300, max: 500 },
      },
      {
        name: "Hammer Obsession", 
        brand: "Hammer",
        hookPotential: "medium-high",
        baseScore: 80,
        preferredConditions: { minLength: 32, maxLength: 40, minVolume: 18, maxVolume: 28 },
        speedRange: { min: 15, max: 19 },
        revRange: { min: 250, max: 450 },
      },
      {
        name: "Roto Grip Idol",
        brand: "Roto Grip", 
        hookPotential: "medium",
        baseScore: 75,
        preferredConditions: { minLength: 30, maxLength: 45, minVolume: 15, maxVolume: 35 },
        speedRange: { min: 13, max: 20 },
        revRange: { min: 200, max: 550 },
      },
    ];

    baseBalls.forEach(ball => {
      let score = ball.baseScore;
      
      // Adjust score based on pattern match
      if (patternLength >= ball.preferredConditions.minLength && 
          patternLength <= ball.preferredConditions.maxLength) {
        score += 10;
      }
      
      if (patternVolume >= ball.preferredConditions.minVolume && 
          patternVolume <= ball.preferredConditions.maxVolume) {
        score += 8;
      }
      
      // Adjust score based on bowler specs
      if (bowlerSpecs.speed >= ball.speedRange.min && 
          bowlerSpecs.speed <= ball.speedRange.max) {
        score += 5;
      }
      
      if (bowlerSpecs.revRate >= ball.revRange.min && 
          bowlerSpecs.revRate <= ball.revRange.max) {
        score += 5;
      }
      
      // Playing style adjustments
      if (bowlerSpecs.playingStyle === "cranker" && ball.hookPotential === "high") {
        score += 8;
      } else if (bowlerSpecs.playingStyle === "stroker" && ball.hookPotential === "medium") {
        score += 6;
      }
      
      // Difficulty adjustments
      if (difficulty === "hard" && ball.hookPotential === "high") {
        score += 5;
      } else if (difficulty === "easy" && ball.hookPotential === "medium") {
        score += 3;
      }
      
      // Generate surface recommendation
      const suggestedSurface = this.getSuggestedSurface(ball.hookPotential, difficulty);
      
      // Calculate entry angle
      const entryAngle = this.calculateEntryAngle(bowlerSpecs, ball.hookPotential);
      
      // Generate reason
      const reason = this.generateReason(ball, pattern, bowlerSpecs);
      
      recommendations.push({
        name: ball.name,
        brand: ball.brand,
        matchScore: Math.min(Math.max(score, 0), 100),
        hookPotential: ball.hookPotential,
        suggestedSurface,
        entryAngle,
        reason,
      });
    });
    
    // Sort by match score descending
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }
  
  private static getSuggestedSurface(hookPotential: string, difficulty: string): string {
    if (hookPotential === "high") {
      return difficulty === "hard" ? "1500 Grit" : "2000 Abralon";
    } else if (hookPotential === "medium-high") {
      return "1500 Grit";
    } else {
      return "3000 Abralon";
    }
  }
  
  private static calculateEntryAngle(bowlerSpecs: BowlerSpecsInput, hookPotential: string): number {
    let baseAngle = 4.0;
    
    // Adjust based on rev rate
    if (bowlerSpecs.revRate > 400) {
      baseAngle += 0.8;
    } else if (bowlerSpecs.revRate < 300) {
      baseAngle -= 0.5;
    }
    
    // Adjust based on hook potential
    if (hookPotential === "high") {
      baseAngle += 0.5;
    } else if (hookPotential === "low") {
      baseAngle -= 0.3;
    }
    
    return Math.round(baseAngle * 10) / 10;
  }
  
  private static generateReason(
    ball: any, 
    pattern: OilPattern, 
    bowlerSpecs: BowlerSpecsInput
  ): string {
    const reasons = [];
    
    if (ball.hookPotential === "high" && pattern.difficulty === "medium") {
      reasons.push("Excellent for medium oil with high hook potential players");
    } else if (ball.hookPotential === "medium" && pattern.difficulty === "easy") {
      reasons.push("Versatile ball that works well on house conditions");
    } else {
      reasons.push("Solid choice for consistent ball reaction");
    }
    
    if (bowlerSpecs.playingStyle === "cranker") {
      reasons.push("matches your power game style");
    } else if (bowlerSpecs.playingStyle === "stroker") {
      reasons.push("complements your smooth release");
    }
    
    return reasons.join(" and ");
  }
}
