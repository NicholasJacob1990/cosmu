import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const { clientId } = params;
  const items = [
    { tag: "Motion Design", specialists: 3, priceFrom: 350, blurb: "Para dar vida às suas apresentações" },
    { tag: "SEO Técnico", specialists: 8, priceFrom: 500, blurb: "Aumente seu tráfego orgânico" },
  ];
  return new Response(JSON.stringify({ clientId, items }), { headers: { "Content-Type": "application/json" } });
}





