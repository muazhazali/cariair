// ==========================================
// Image Serving API Route
// GET /api/images/[id] - Serve image from BYTEA
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { getImageData } from "@/lib/db/images";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const imageData = await getImageData(id);
    
    if (!imageData) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }
    
    // Return image with appropriate headers
    // Create a proper Buffer from the data
    const imageBuffer = Buffer.from(imageData.data);
    return new Response(imageBuffer, {
      headers: {
        "Content-Type": imageData.mimeType,
        "Content-Disposition": `inline; filename="${imageData.filename}"`,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    );
  }
}
