import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string; type: string } }
) {
  const { userId, type } = params;
  const data = {
    userId,
    type,
    generatedAt: new Date().toISOString(),
    series: [
      { label: "This Month", value: 100 },
      { label: "Last Month", value: 82 },
      { label: "Target", value: 120 },
    ],
  };
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
}





