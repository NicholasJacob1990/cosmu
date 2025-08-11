import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || 50);
  const offset = Number(url.searchParams.get("offset") || 0);

  const { mockProjects } = await import("@/lib/mockData");
  const slice = mockProjects.slice(offset, offset + limit);

  return new Response(
    JSON.stringify({ projects: slice, total: mockProjects.length }),
    { headers: { "Content-Type": "application/json" } }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Echo mock creating with id
  const project = { ...body, id: String(Date.now()), createdAt: new Date(), updatedAt: new Date() };
  return new Response(JSON.stringify(project), { headers: { "Content-Type": "application/json" } });
}





