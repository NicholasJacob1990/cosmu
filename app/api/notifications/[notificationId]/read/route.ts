import { NextRequest } from "next/server";

export async function PUT(
  _req: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  // Mock: mark as read. No persistence.
  return new Response(null, { status: 204 });
}





