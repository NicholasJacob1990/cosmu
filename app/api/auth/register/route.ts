import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const now = new Date();
  const user = {
    id: `user-${Date.now()}`,
    email: body.email,
    name: `${body.firstName || body.first_name || "User"} ${body.lastName || body.last_name || ""}`.trim(),
    type: (body.userType || body.user_type || "professional") as "client" | "professional",
    verificationStatus: "pending" as const,
    subscription: { plan: "free" as const, expiresAt: now },
  };
  const token = `mock-token-${Date.now()}`;
  return new Response(JSON.stringify({ user, token }), { headers: { "Content-Type": "application/json" } });
}





