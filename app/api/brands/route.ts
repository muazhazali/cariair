// ==========================================
// Brands API Route
// GET /api/brands - List brands
// POST /api/brands - Create brand (authenticated)
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBrands, createBrand } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const brands = await getBrands();
    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
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
    if (!body.brand_name) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }
    
    const brand = await createBrand(body);
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
