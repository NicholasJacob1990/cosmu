import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { mockMetrics } = await import("@/lib/mockData");
  // Return the same mock for simplicity
  return new Response(JSON.stringify(mockMetrics), { headers: { "Content-Type": "application/json" } });
}





