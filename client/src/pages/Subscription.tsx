import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSubscription } from "@/services/auth";
import { useToast } from "@/components/ui/use-toast";

export default function Subscription() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast({
        title: "Success",
        description: "Your subscription has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return <div>You must be logged in to view this page.</div>;
  }

  const handleUpgrade = () => {
    mutation.mutate("premium");
  };

  const handleDowngrade = () => {
    mutation.mutate("free");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Subscription</h1>
      <p>Your current subscription is: <strong>{user?.subscription}</strong></p>
      <div className="flex space-x-4">
        {user?.subscription === "free" && (
          <Button onClick={handleUpgrade} disabled={mutation.isPending}>
            {mutation.isPending ? "Upgrading..." : "Upgrade to Premium"}
          </Button>
        )}
        {user?.subscription === "premium" && (
          <Button onClick={handleDowngrade} disabled={mutation.isPending}>
            {mutation.isPending ? "Downgrading..." : "Downgrade to Free"}
          </Button>
        )}
      </div>
    </div>
  );
}
