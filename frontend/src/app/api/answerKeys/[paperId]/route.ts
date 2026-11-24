import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ paperId: string }> }
) {
  const { paperId } = await context.params;
  const cleanPaperId = paperId.trim();
  const url = `${FASTAPI_URL}/api/answer-keys/${encodeURIComponent(cleanPaperId)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": INTERNAL_API_KEY,
      },
      cache: "no-store",
    });

    const rawBody = await res.text();

    if (!res.ok) {
      return new NextResponse(
        rawBody || JSON.stringify({ error: "Failed to load answer key" }),
        {
          status: res.status,
          headers: {
            "Content-Type":
              res.headers.get("content-type") || "application/json",
          },
        }
      );
    }

    return new NextResponse(rawBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach backend service" },
      { status: 502 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ paperId: string }> }
) {
  const { paperId } = await context.params;
  const cleanPaperId = paperId.trim();
  const url = `${FASTAPI_URL}/api/answer-keys/${encodeURIComponent(cleanPaperId)}`;

  try {
    const rawPayload = await req.text();

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": req.headers.get("content-type") || "application/json",
        "X-API-Key": INTERNAL_API_KEY,
      },
      body: rawPayload,
      cache: "no-store",
    });

    const rawBody = await res.text();

    if (!res.ok) {
      return new NextResponse(
        rawBody || JSON.stringify({ error: "Failed to update answer key" }),
        {
          status: res.status,
          headers: {
            "Content-Type":
              res.headers.get("content-type") || "application/json",
          },
        }
      );
    }

    return new NextResponse(rawBody, {
      status: res.status,
      headers: {
        "Content-Type":
          res.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach backend service" },
      { status: 502 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ paperId: string }> }
) {
  const { paperId } = await context.params;
  const cleanPaperId = paperId.trim();
  if (!cleanPaperId) {
    return NextResponse.json({ error: "Invalid paperId" }, { status: 400 });
  }

  const response = await fetch(
    `${FASTAPI_URL}/api/answer-keys/${encodeURIComponent(cleanPaperId)}`,
    {
      method: "DELETE",
      headers: {
        "X-API-Key": INTERNAL_API_KEY,
      },
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}4