import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { mockProjects } = await import("@/lib/mockData");
  const project = mockProjects.find((p) => p.id === params.projectId) || null;
  if (!project) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }
  return new Response(JSON.stringify(project), { headers: { "Content-Type": "application/json" } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const updates = await req.json();
  return new Response(
    JSON.stringify({ id: params.projectId, ...updates, updatedAt: new Date() }),
    { headers: { "Content-Type": "application/json" } }
  );
}

export async function DELETE() {
  return new Response(null, { status: 204 });
}





