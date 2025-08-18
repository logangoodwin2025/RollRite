import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
