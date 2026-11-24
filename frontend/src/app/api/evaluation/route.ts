import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ;

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paperId = request.nextUrl.searchParams.get("paperId");
  const query = paperId ? `?paper_id=${encodeURIComponent(paperId)}` : "";

  const response = await fetch(`${FASTAPI_URL}/api/evaluations${query}`, {
    headers: { "X-API-Key": INTERNAL_API_KEY as string},
    cache: "no-store",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}