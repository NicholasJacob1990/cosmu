import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  const { mockMessages } = await import("@/lib/mockData");
  const result = projectId ? mockMessages.filter((m) => m.projectId === projectId) : mockMessages;
  return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message = { id: `msg-${Date.now()}`, createdAt: new Date(), read: false, ...body };
  return new Response(JSON.stringify(message), { headers: { "Content-Type": "application/json" } });
}





