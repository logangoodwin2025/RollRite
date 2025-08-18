import type { User } from "@shared/schema";

export async function me(): Promise<User> {
  const res = await fetch("/api/me");
  if (!res.ok) {
    throw new Error("Not authenticated");
  }
  return res.json();
}

export async function register(data: { username: string, password: string }): Promise<{ message: string, user: User }> {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to register");
  }
  return res.json();
}

export async function login(data: { username: string, password: string }): Promise<{ message: string, user: User }> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to login");
  }
  return res.json();
}

export async function logout(): Promise<{ message: string }> {
  const res = await fetch("/api/logout", {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to logout");
  }
  return res.json();
}

export async function updateSubscription(subscription: string): Promise<User> {
  const res = await fetch("/api/subscription", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscription }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update subscription");
  }
  return res.json();
}
