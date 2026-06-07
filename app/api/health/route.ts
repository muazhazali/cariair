// ==========================================
// Health Check / DB Test API Route
// GET /api/health - Check database connectivity
// ==========================================

import { NextResponse } from "next/server";
import { testConnection, query } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    const connected = await testConnection();
    
    if (!connected) {
      return NextResponse.json(
        { status: "error", message: "Database connection failed" },
        { status: 500 }
      );
    }
    
    // Get some basic stats
    const brandCount = await query("SELECT COUNT(*) FROM brands");
    const sourceCount = await query("SELECT COUNT(*) FROM sources");
    const productCount = await query("SELECT COUNT(*) FROM products");
    
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      stats: {
        brands: parseInt(brandCount.rows[0].count),
        sources: parseInt(sourceCount.rows[0].count),
        products: parseInt(productCount.rows[0].count),
      },
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      { status: "error", message: "Health check failed" },
      { status: 500 }
    );
  }
}
