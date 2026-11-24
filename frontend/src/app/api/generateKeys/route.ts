import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const paperId = formData.get("paper_id");
    const file = formData.get("file");

    if (!paperId || !file) {
      return NextResponse.json(
        { error: "paper_id and file are required" },
        { status: 400 }
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("paper_id", String(paperId).trim());
    backendFormData.append("file", file);

    const response = await fetch(`${FASTAPI_URL}/api/generate-key`, {
      method: "POST",
      headers: {
        "X-API-Key": INTERNAL_API_KEY,
      },
      body: backendFormData,
    });

    const rawText = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: rawText || "Backend returned a non-JSON error" },
        { status: response.status || 502 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}