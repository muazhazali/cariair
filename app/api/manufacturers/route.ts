// ==========================================
// Manufacturers API Route
// GET /api/manufacturers - List manufacturers
// POST /api/manufacturers - Create manufacturer (authenticated)
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getManufacturers, createManufacturer } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const manufacturers = await getManufacturers();
    return NextResponse.json({ manufacturers });
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    return NextResponse.json(
      { error: "Failed to fetch manufacturers" },
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
    if (!body.name) {
      return NextResponse.json(
        { error: "Manufacturer name is required" },
        { status: 400 }
      );
    }
    
    const manufacturer = await createManufacturer(body);
    return NextResponse.json(manufacturer, { status: 201 });
  } catch (error) {
    console.error("Error creating manufacturer:", error);
    return NextResponse.json(
      { error: "Failed to create manufacturer" },
      { status: 500 }
    );
  }
}
