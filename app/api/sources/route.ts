// ==========================================
// Sources API Route
// GET /api/sources - List sources
// POST /api/sources - Create source (authenticated)
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSources, createSource, getSourcesWithCoordinates } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if map data is requested
    const forMap = searchParams.get("map") === "true";
    
    let sources;
    if (forMap) {
      sources = await getSourcesWithCoordinates();
    } else {
      sources = await getSources();
    }
    
    return NextResponse.json({ sources });
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validation
    if (!body.source_name) {
      return NextResponse.json(
        { error: "Source name is required" },
        { status: 400 }
      );
    }
    
    const source = await createSource(body);
    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error("Error creating source:", error);
    return NextResponse.json(
      { error: "Failed to create source" },
      { status: 500 }
    );
  }
}
