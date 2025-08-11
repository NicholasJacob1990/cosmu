import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const { mockNotifications } = await import("@/lib/mockData");
  const data = userId ? mockNotifications.filter((n) => n.userId === userId) : mockNotifications;
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
}

export async function DELETE(req: NextRequest) {
  // Clear notifications (mock). In real app, delete user notifications
  return new Response(null, { status: 204 });
}





