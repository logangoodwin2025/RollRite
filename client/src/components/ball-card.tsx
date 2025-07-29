import { Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { BowlingBall } from "@shared/schema";

interface BallCardProps {
  ball: BowlingBall;
  onDelete: () => void;
  onEdit?: () => void;
}

export function BallCard({ ball, onDelete, onEdit }: BallCardProps) {
  const usagePercentage = Math.min((ball.gamesPlayed / 200) * 100, 100);
  
  const getScoreColor = (score: string | null) => {
    if (!score) return "text-gray-500";
    const numScore = parseFloat(score);
    if (numScore >= 200) return "text-success-green";
    if (numScore >= 180) return "text-amber-accent";
    return "text-bowling-blue";
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-32 md:h-48 bg-gradient-to-br from-bowling-blue to-blue-600 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 text-white">
          <h3 className="text-lg md:text-xl font-bold">{ball.name}</h3>
          <p className="text-blue-100 text-sm md:text-base">{ball.brand}</p>
        </div>
      </div>
      
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-3 md:mb-4">
          <div>
            <span className="text-xs md:text-sm text-gray-600 capitalize">{ball.coreType} {ball.coverstockType}</span>
          </div>
          <div className="flex space-x-1 md:space-x-2">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-3 w-3 md:h-4 md:w-4 text-bowling-blue" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-pin-red" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Weight:</span>
            <span className="font-medium">{ball.weight} lbs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Surface:</span>
            <span className="font-medium text-right ml-2">{ball.surface}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Drilling:</span>
            <span className="font-medium text-right ml-2">{ball.drilling}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Games:</span>
            <span className="font-medium">{ball.gamesPlayed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Hook Potential:</span>
            <span className="font-medium capitalize">{ball.hookPotential}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avg Score:</span>
            <span className={`font-medium ${getScoreColor(ball.averageScore)}`}>
              {ball.averageScore ? parseFloat(ball.averageScore).toFixed(0) : "N/A"}
            </span>
          </div>
        </div>
        
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Usage</div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="text-xs text-gray-500 mt-1">
            {ball.gamesPlayed} games played
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
