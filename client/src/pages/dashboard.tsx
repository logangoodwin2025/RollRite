import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, RotateCcw, Trophy, Zap, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import type { PerformanceData, BowlingBall, OilPattern } from "../../shared/schema";

const COLORS = ['hsl(221, 83%, 32%)', 'hsl(0, 74%, 50%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)'];

export default function Dashboard() {
  const { user, token } = useAuth();

  const { data: performanceData, isLoading: performanceLoading } = useQuery<PerformanceData[]>({
    queryKey: ["/api/performance", user?.id],
    queryFn: () => fetch(`/api/performance`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json()),
    enabled: !!user,
  });

  const { data: balls, isLoading: ballsLoading } = useQuery<BowlingBall[]>({
    queryKey: ["/api/balls", user?.id],
    queryFn: () => fetch(`/api/balls`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json()),
    enabled: !!user,
  });

  const { data: patterns, isLoading: patternsLoading } = useQuery<OilPattern[]>({
    queryKey: ["/api/patterns"],
    queryFn: () => fetch("/api/patterns", { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json()),
    enabled: !!user,
  });

  const stats = useMemo(() => {
    if (!performanceData || performanceData.length === 0) {
      return {
        averageScore: 0,
        carryPercentage: 0,
        entryAngle: 0,
        gamesPlayed: 0,
        scoreData: [],
        ballUsageData: [],
        recentGames: [],
      };
    }

    const gamesPlayed = performanceData.length;
    const averageScore = performanceData.reduce((acc, game) => acc + game.score, 0) / gamesPlayed;
    const carryPercentage = performanceData.reduce((acc, game) => acc + parseFloat(String(game.carryPercentage)), 0) / gamesPlayed;
    const entryAngle = performanceData.reduce((acc, game) => acc + parseFloat(String(game.entryAngle)), 0) / gamesPlayed;

    const scoreData = performanceData
      .slice()
      .sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime())
      .slice(-12)
      .map(game => ({
        date: format(new Date(game.gameDate), "MMM d"),
        score: game.score,
      }));

    const ballUsage = performanceData.reduce((acc, game) => {
      acc[game.ballId] = (acc[game.ballId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ballUsageData = Object.entries(ballUsage).map(([ballId, count]) => {
      const ball = balls?.find(b => b.id === ballId);
      return {
        name: ball?.name || "Unknown Ball",
        value: (count / gamesPlayed) * 100,
        games: count,
      };
    });

    const recentGames = performanceData
      .slice()
      .sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())
      .slice(0, 5)
      .map(game => {
        const ball = balls?.find(b => b.id === game.ballId);
        const pattern = patterns?.find(p => p.id === game.patternId);
        return {
          date: format(new Date(game.gameDate), "MMM d, yyyy"),
          venue: game.venue,
          pattern: pattern?.name || "Unknown Pattern",
          ball: ball?.name || "Unknown Ball",
          score: game.score,
          carry: parseFloat(String(game.carryPercentage)),
        }
      });

    return {
      averageScore,
      carryPercentage,
      entryAngle,
      gamesPlayed,
      scoreData,
      ballUsageData,
      recentGames,
    };
  }, [performanceData, balls, patterns]);

  if (performanceLoading || ballsLoading || patternsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 md:h-32 aspect-square md:aspect-auto" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">Welcome, {user?.username}!</h1>
        <p className="text-sm md:text-base text-gray-600">Track your bowling performance and statistics over time</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-l-4 border-l-success-green aspect-square md:aspect-auto">
          <CardContent className="p-4 md:p-6 h-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between h-full">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Average Score</p>
                <p className="text-xl md:text-3xl font-bold text-charcoal mb-1 md:mb-0">{stats.averageScore.toFixed(0)}</p>
              </div>
              <Zap className="hidden md:block h-10 w-10 text-success-green opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-accent aspect-square md:aspect-auto">
          <CardContent className="p-4 md:p-6 h-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between h-full">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Carry Percentage</p>
                <p className="text-xl md:text-3xl font-bold text-charcoal mb-1 md:mb-0">{stats.carryPercentage.toFixed(1)}%</p>
              </div>
              <Target className="hidden md:block h-10 w-10 text-amber-accent opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-bowling-blue aspect-square md:aspect-auto">
          <CardContent className="p-4 md:p-6 h-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between h-full">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Entry Angle</p>
                <p className="text-xl md:text-3xl font-bold text-charcoal mb-1 md:mb-0">{stats.entryAngle.toFixed(1)}°</p>
              </div>
              <RotateCcw className="hidden md:block h-10 w-10 text-bowling-blue opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pin-red aspect-square md:aspect-auto">
          <CardContent className="p-4 md:p-6 h-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between h-full">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Games Played</p>
                <p className="text-xl md:text-3xl font-bold text-charcoal mb-1 md:mb-0">{stats.gamesPlayed}</p>
              </div>
              <Trophy className="hidden md:block h-10 w-10 text-pin-red opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Score Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg md:text-xl">
              <BarChart3 className="h-5 w-5 text-bowling-blue mr-2" />
              Score Trend (Last 12 Games)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.scoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[100, 300]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(221, 83%, 32%)" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(221, 83%, 32%)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ball Usage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg md:text-xl">
              <Target className="h-5 w-5 text-bowling-blue mr-2" />
              Ball Usage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 md:h-64 flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 h-32 md:h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.ballUsageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stats.ballUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-2 md:space-y-3 mt-4 md:mt-0">
                {stats.ballUsageData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center">
                    <div 
                      className="w-3 h-3 md:w-4 md:h-4 rounded mr-2 md:mr-3" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="text-xs md:text-sm">
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-gray-500">{entry.value.toFixed(1)}% ({entry.games} games)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Games Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg md:text-xl">
            <Trophy className="h-5 w-5 text-bowling-blue mr-2" />
            Recent Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-4">
            {stats.recentGames.map((game, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-charcoal">{game.date}</div>
                  <div className="text-lg font-bold text-success-green">{game.score}</div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><span className="font-medium">Venue:</span> {game.venue}</div>
                  <div><span className="font-medium">Pattern:</span> {game.pattern}</div>
                  <div><span className="font-medium">Ball:</span> {game.ball}</div>
                  <div><span className="font-medium">Carry:</span> {game.carry}%</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oil Pattern</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ball Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carry %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentGames.map((game, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">{game.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">{game.venue}</td>
                    <td className="px-6 py-4 whitespace-now_req.userId!rap text-sm text-charcoal">{game.pattern}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">{game.ball}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-success-green">{game.score}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">{game.carry}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
