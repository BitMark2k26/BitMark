import { NextResponse } from "next/server";

export async function GET() {
  const url = `${process.env.FASTAPI_URL}/api/health`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ status: "waking" }, { status: 503 });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: "waking" }, { status: 503 });
  }
}