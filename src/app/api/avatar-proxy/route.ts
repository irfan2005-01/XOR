import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTNAME = "sgp.cloud.appwrite.io";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return new NextResponse("Invalid URL parameter", { status: 400 });
  }

  // Strict host validation to prevent open-proxy abuse
  if (
    parsed.protocol !== "https:" &&
    parsed.protocol !== "http:"
  ) {
    return new NextResponse("Invalid URL protocol", { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_HOSTNAME && !parsed.hostname.endsWith(".appwrite.io")) {
    return new NextResponse("Target host not allowed", { status: 403 });
  }

  try {
    const upstreamRes = await fetch(parsed.toString(), {
      headers: {
        Accept: "image/*",
      },
      // Cache at edge/CDN or ISR
      next: { revalidate: 3600 },
    });

    if (!upstreamRes.ok) {
      return new NextResponse("Upstream avatar fetch failed", {
        status: upstreamRes.status,
      });
    }

    const contentType =
      upstreamRes.headers.get("content-type") || "image/jpeg";
    const imageBytes = await upstreamRes.arrayBuffer();

    return new NextResponse(imageBytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse("Failed to proxy avatar", { status: 502 });
  }
}
