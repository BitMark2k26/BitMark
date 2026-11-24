import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!FASTAPI_URL || !INTERNAL_API_KEY) {
    return NextResponse.json(
      { error: "Server configuration missing FASTAPI_URL or INTERNAL_API_KEY" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const paperId = String(formData.get("paper_id") ?? "").trim();
  const studentName = String(formData.get("student_name") ?? "").trim();
  const file = formData.get("file");

  if (!paperId || !file) {
    return NextResponse.json(
      { error: "paper_id and file are required" },
      { status: 400 }
    );
  }

  const backendFormData = new FormData();
  backendFormData.append("paper_id", paperId);
  backendFormData.append("file", file);
  if (studentName) {
    backendFormData.append("student_name", studentName);
  }

  const response = await fetch(`${FASTAPI_URL}/api/grade-paper`, {
    method: "POST",
    headers: {
      "X-API-Key": INTERNAL_API_KEY,
    },
    body: backendFormData,
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}