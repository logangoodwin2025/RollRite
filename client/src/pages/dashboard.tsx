import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, RotateCcw, Trophy, Zap, BarChart3 } from "lucide-react";

// Mock user ID for demo purposes
const DEMO_USER_ID = "demo-user";

const COLORS = ['hsl(221, 83%, 32%)', 'hsl(0, 74%, 50%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)'];

export default function Dashboard() {
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/performance", DEMO_USER_ID],
    enabled: !!DEMO_USER_ID,
  });

  const { data: balls, isLoading: ballsLoading } = useQuery({
    queryKey: ["/api/balls", DEMO_USER_ID],
    enabled: !!DEMO_USER_ID,
  });

  // Mock data for charts since we don't have real performance data yet
  const scoreData = [
    { week: 'W1', score: 195 },
    { week: 'W2', score: 202 },
    { week: 'W3', score: 198 },
    { week: 'W4', score: 205 },
    { week: 'W5', score: 210 },
    { week: 'W6', score: 208 },
    { week: 'W7', score: 215 },
    { week: 'W8', score: 212 },
    { week: 'W9', score: 218 },
    { week: 'W10', score: 220 },
    { week: 'W11', score: 216 },
    { week: 'W12', score: 222 },
  ];

  const ballUsageData = [
    { name: 'Storm Phaze II', value: 25, games: 89 },
    { name: 'Hammer Obsession', value: 18.5, games: 156 },
    { name: 'Roto Grip Idol', value: 12.5, games: 67 },
    { name: 'Other', value: 44, games: 30 },
  ];

  const recentGames = [
    {
      date: "Jan 28, 2025",
      venue: "Strike Zone Lanes",
      pattern: "PBA Shark (39ft)",
      ball: "Storm Phaze II",
      score: 218,
      carry: 91.2
    },
    {
      date: "Jan 26, 2025",
      venue: "Championship Bowling",
      pattern: "WTBA Beijing (37ft)",
      ball: "Hammer Obsession",
      score: 198,
      carry: 84.6
    },
    {
      date: "Jan 24, 2025",
      venue: "Pro Bowl Center",
      pattern: "Kegel Main Street (40ft)",
      ball: "Roto Grip Idol",
      score: 215,
      carry: 88.9
    }
  ];

  if (performanceLoading || ballsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal mb-2">Performance Dashboard</h1>
        <p className="text-gray-600">Track your bowling performance and statistics over time</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-success-green">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-charcoal">204</p>
                <p className="text-sm text-success-green flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8.5 from last month
                </p>
              </div>
              <Zap className="h-10 w-10 text-success-green opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Carry Percentage</p>
                <p className="text-3xl font-bold text-charcoal">87.2%</p>
                <p className="text-sm text-amber-accent flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +2.1% this week
                </p>
              </div>
              <Target className="h-10 w-10 text-amber-accent opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-bowling-blue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Entry Angle</p>
                <p className="text-3xl font-bold text-charcoal">4.8°</p>
                <p className="text-sm text-bowling-blue flex items-center">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Consistent
                </p>
              </div>
              <RotateCcw className="h-10 w-10 text-bowling-blue opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pin-red">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Games Played</p>
                <p className="text-3xl font-bold text-charcoal">342</p>
                <p className="text-sm text-pin-red flex items-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  This season
                </p>
              </div>
              <Trophy className="h-10 w-10 text-pin-red opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 text-bowling-blue mr-2" />
              Score Trend (Last 12 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[180, 230]} />
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
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 text-bowling-blue mr-2" />
              Ball Usage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ballUsageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {ballUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3">
                {ballUsageData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-3" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="text-sm">
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-gray-500">{entry.value}%</div>
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
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 text-bowling-blue mr-2" />
            Recent Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {recentGames.map((game, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">{game.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">{game.venue}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">{game.pattern}</td>
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
