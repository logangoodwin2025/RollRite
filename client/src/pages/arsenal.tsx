import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, List } from "lucide-react";
import { BallCard } from "@/components/ball-card";
import { AddBallModal } from "@/components/add-ball-modal";
import type { BowlingBall } from "@shared/schema";

// Mock user ID for demo purposes
const DEMO_USER_ID = "demo-user";

export default function Arsenal() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: balls, isLoading } = useQuery({
    queryKey: ["/api/balls", DEMO_USER_ID],
    enabled: !!DEMO_USER_ID,
  });

  const deleteBall = useMutation({
    mutationFn: async (ballId: string) => {
      const response = await fetch(`/api/balls/${ballId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete ball");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/balls", DEMO_USER_ID] });
    },
  });

  const handleDeleteBall = (ballId: string) => {
    if (confirm("Are you sure you want to delete this ball?")) {
      deleteBall.mutate(ballId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">My Arsenal</h1>
          <p className="text-sm md:text-base text-gray-600">Manage your bowling ball collection and track performance</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-bowling-blue hover:bg-blue-800 text-white w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Ball
        </Button>
      </div>

      {/* Arsenal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {balls?.map((ball: BowlingBall) => (
          <BallCard 
            key={ball.id} 
            ball={ball} 
            onDelete={() => handleDeleteBall(ball.id)}
          />
        ))}

        {/* Add Ball Card */}
        <Card 
          className="border-2 border-dashed border-gray-300 hover:border-bowling-blue transition-colors cursor-pointer"
          onClick={() => setIsAddModalOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Plus className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Add New Ball</h3>
            <p className="text-sm text-gray-500">Track a new bowling ball in your arsenal</p>
          </CardContent>
        </Card>
      </div>

      {balls?.length === 0 && (
        <Card className="p-12 text-center">
          <CardContent>
            <List className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No Balls in Arsenal</h3>
            <p className="text-gray-400 mb-4">Start building your arsenal by adding your first bowling ball</p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-bowling-blue hover:bg-blue-800 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Ball
            </Button>
          </CardContent>
        </Card>
      )}

      <AddBallModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        userId={DEMO_USER_ID}
      />
    </div>
  );
}
