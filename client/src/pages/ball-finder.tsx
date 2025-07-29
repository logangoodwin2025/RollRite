import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Trophy, Award, Target, Route } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BallRecommendation {
  name: string;
  brand: string;
  matchScore: number;
  hookPotential: string;
  suggestedSurface: string;
  entryAngle: number;
  reason: string;
}

export default function BallFinder() {
  const [selectedPatternId, setSelectedPatternId] = useState<string>("");
  const [speed, setSpeed] = useState([16]);
  const [revRate, setRevRate] = useState([350]);
  const [playingStyle, setPlayingStyle] = useState<string>("");
  const [showResults, setShowResults] = useState(false);

  const { data: patterns, isLoading: patternsLoading } = useQuery({
    queryKey: ["/api/patterns"],
  });

  const recommendBalls = useMutation({
    mutationFn: async (data: { patternId: string; bowlerSpecs: any }) => {
      const response = await apiRequest("POST", "/api/recommend-balls", data);
      return response.json();
    },
    onSuccess: () => {
      setShowResults(true);
    },
  });

  const selectedPattern = patterns?.find((p: any) => p.id === selectedPatternId);

  const handleAnalysis = () => {
    if (!selectedPatternId || !playingStyle) return;

    const bowlerSpecs = {
      speed: speed[0],
      revRate: revRate[0],
      playingStyle,
    };

    recommendBalls.mutate({ patternId: selectedPatternId, bowlerSpecs });
  };

  const recommendations: BallRecommendation[] = recommendBalls.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">Find Best Ball</h1>
        <p className="text-sm md:text-base text-gray-600">Get personalized ball recommendations based on your style and lane conditions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Input Parameters */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          {/* Oil Pattern Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 text-bowling-blue mr-2" />
                Oil Pattern
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Pattern</label>
                {patternsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedPatternId} onValueChange={setSelectedPatternId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an oil pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {patterns?.map((pattern: any) => (
                        <SelectItem key={pattern.id} value={pattern.id}>
                          {pattern.name} ({pattern.length}ft)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              {/* Pattern Visualization */}
              {selectedPattern && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center text-sm text-gray-600 mb-2">Pattern Visualization</div>
                  <div className="h-24 bg-gradient-to-r from-bowling-blue via-blue-300 to-bowling-blue rounded-lg relative">
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                      {selectedPattern.name} {selectedPattern.length}ft - {selectedPattern.difficulty}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 text-center">
                    Volume: {selectedPattern.volume}mL | Ratio: {selectedPattern.ratio}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bowler Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 text-bowling-blue mr-2" />
                Bowler Specs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ball Speed (mph)</label>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  max={22}
                  min={12}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>12</span>
                  <span className="font-medium text-bowling-blue">{speed[0]}</span>
                  <span>22</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rev Rate (rpm)</label>
                <Slider
                  value={revRate}
                  onValueChange={setRevRate}
                  max={600}
                  min={200}
                  step={25}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>200</span>
                  <span className="font-medium text-bowling-blue">{revRate[0]}</span>
                  <span>600</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Playing Style</label>
                <Select value={playingStyle} onValueChange={setPlayingStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your playing style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stroker">Stroker</SelectItem>
                    <SelectItem value="tweener">Tweener</SelectItem>
                    <SelectItem value="cranker">Cranker</SelectItem>
                    <SelectItem value="power_player">Power Player</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Button */}
          <Button 
            onClick={handleAnalysis}
            disabled={!selectedPatternId || !playingStyle || recommendBalls.isPending}
            className="w-full bg-bowling-blue hover:bg-blue-800 text-white font-semibold py-3 md:py-4 px-4 md:px-6 text-sm md:text-base"
          >
            <Search className="h-4 w-4 mr-2" />
            {recommendBalls.isPending ? "Analyzing..." : "Run Ball Analysis"}
          </Button>
        </div>

        {/* Results Display */}
        <div className="lg:col-span-2">
          {showResults && recommendations.length > 0 ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 text-amber-accent mr-2" />
                    Recommended Balls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.map((ball, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${
                        index === 0 
                          ? "border-2 border-success-green bg-green-50" 
                          : "border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Badge 
                              variant={index === 0 ? "default" : "secondary"}
                              className={
                                index === 0 
                                  ? "bg-success-green text-white" 
                                  : index === 1 
                                  ? "bg-amber-accent text-white"
                                  : "bg-bowling-blue text-white"
                              }
                            >
                              {index === 0 ? "BEST MATCH" : index === 1 ? "GOOD FIT" : "ALTERNATIVE"}
                            </Badge>
                            <h4 className="text-lg font-semibold text-charcoal ml-3">
                              {ball.name}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{ball.reason}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="font-medium">Hook Potential:</span> {ball.hookPotential}</div>
                            <div><span className="font-medium">Match Score:</span> {ball.matchScore}/100</div>
                            <div><span className="font-medium">Suggested Surface:</span> {ball.suggestedSurface}</div>
                            <div><span className="font-medium">Entry Angle:</span> {ball.entryAngle}°</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Hook Trajectory Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Route className="h-5 w-5 text-bowling-blue mr-2" />
                    Projected Hook Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      {/* Lane representation */}
                      <rect x="20" y="80" width="360" height="40" fill="#F3F4F6" stroke="#D1D5DB"/>
                      <text x="25" y="75" className="text-xs fill-gray-500">Foul Line</text>
                      <text x="350" y="75" className="text-xs fill-gray-500">Pins</text>
                      
                      {/* Ball trajectories */}
                      {recommendations.slice(0, 3).map((ball, index) => {
                        const colors = ["#10B981", "#F59E0B", "#1E3A8A"];
                        const dashArrays = ["5,5", "none", "10,5"];
                        const yOffsets = [60, 70, 80];
                        
                        return (
                          <g key={index}>
                            <path 
                              d={`M 30 100 Q ${200 - index * 20} ${yOffsets[index]} 370 100`} 
                              stroke={colors[index]} 
                              strokeWidth="3" 
                              fill="none" 
                              strokeDasharray={dashArrays[index]}
                            />
                            <text x="35" y={115 + index * 15} className={`text-xs`} fill={colors[index]}>
                              {ball.name}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Pins representation */}
                      <circle cx="370" cy="100" r="3" fill="#DC2626"/>
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Default state */
            <Card className="h-96 flex items-center justify-center">
              <CardContent className="text-center">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">Ready to Find Your Perfect Ball?</h3>
                <p className="text-gray-400">Configure your bowler specifications and oil pattern to get personalized recommendations</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
