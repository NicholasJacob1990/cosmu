import { NextRequest } from "next/server";

export async function PUT(
  _req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  // Mock: mark message as read
  return new Response(null, { status: 204 });
}




