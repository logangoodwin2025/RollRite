import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OilPattern } from "@shared/schema";

interface PatternCardProps {
  pattern: OilPattern;
}

export function PatternCard({ pattern }: PatternCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "pba": return "bg-bowling-blue text-white";
      case "wtba": return "bg-success-green text-white";
      case "kegel": return "bg-amber-accent text-white";
      case "custom": return "bg-gray-600 text-white";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-success-green";
      case "medium": return "text-amber-accent";
      case "hard": return "text-pin-red";
      default: return "text-gray-500";
    }
  };

  const getPatternGradient = (category: string) => {
    switch (category) {
      case "pba": return "from-bowling-blue via-blue-300 to-bowling-blue";
      case "wtba": return "from-success-green via-green-300 to-success-green";
      case "kegel": return "from-amber-accent via-yellow-300 to-amber-accent";
      case "custom": return "from-gray-600 via-gray-300 to-gray-600";
      default: return "from-gray-400 via-gray-200 to-gray-400";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-charcoal">{pattern.name}</h3>
            <Badge className={`mt-1 ${getCategoryColor(pattern.category)}`}>
              {pattern.category.toUpperCase()}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-bowling-blue">{pattern.length}ft</div>
            <div className="text-sm text-gray-600">Length</div>
          </div>
        </div>
        
        {/* Pattern Visualization */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className={`h-24 bg-gradient-to-r ${getPatternGradient(pattern.category)} rounded-lg relative`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-2 bg-gradient-to-r from-opacity-80 via-opacity-40 to-opacity-80 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Volume:</span>
            <span className="font-medium">{pattern.volume} mL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ratio:</span>
            <span className="font-medium">{pattern.ratio}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Difficulty:</span>
            <span className={`font-medium capitalize ${getDifficultyColor(pattern.difficulty)}`}>
              {pattern.difficulty}
            </span>
          </div>
        </div>
        
        {pattern.description && (
          <p className="text-sm text-gray-600 mb-4">{pattern.description}</p>
        )}
        
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            View Details
          </Button>
          {pattern.isCustom === "true" && (
            <Button variant="outline" className="text-pin-red hover:text-red-700">
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
