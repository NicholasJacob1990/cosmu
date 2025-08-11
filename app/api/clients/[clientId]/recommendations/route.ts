import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const { clientId } = params;
  const recs = [
    { id: "pro-1", name: "João Silva", category: "Design Gráfico", rating: 4.9, projects: 5 },
    { id: "pro-2", name: "Maria Santos", category: "Desenvolvimento Web", rating: 4.8, projects: 3 },
  ];
  return new Response(JSON.stringify({ clientId, recommendations: recs }), { headers: { "Content-Type": "application/json" } });
}





