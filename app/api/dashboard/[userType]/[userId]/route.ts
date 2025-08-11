import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { userType: string; userId: string } }
) {
  const { userType, userId } = params;
  // Simple mock using server route to align with lib/api expectations
  const { mockProjects, mockMessages, mockNotifications, mockMetrics } = await import("@/lib/mockData");

  const user = {
    id: userId,
    type: userType === "client" ? "client" : "professional",
    email: `${userId}@example.com`,
    name: userType === "client" ? "Cliente Demo" : "Profissional Demo",
    verificationStatus: "verified" as const,
    subscription: { plan: "free" as const, expiresAt: new Date() },
  };

  return new Response(
    JSON.stringify({
      user,
      projects: mockProjects,
      messages: mockMessages,
      notifications: mockNotifications,
      metrics: mockMetrics,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}





