import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await context.params;
  const response = await fetch(
    `${FASTAPI_URL}/api/jobs/${encodeURIComponent(jobId)}`,
    {
      method: "DELETE",
      headers: {
        "X-API-Key": INTERNAL_API_KEY as string,
      },
    }
  );

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
export async function GET(_request: NextRequest, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await context.params;
  const response = await fetch(
    `${FASTAPI_URL as string}/api/jobs/${encodeURIComponent(jobId)}`,
    {
      headers: { "X-API-Key": INTERNAL_API_KEY },
      cache: "no-store",
    }
  );

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}