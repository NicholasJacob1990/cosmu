import { NextRequest } from "next/server";

export async function DELETE(_req: NextRequest) {
  // Mock clear
  return new Response(null, { status: 204 });
}





