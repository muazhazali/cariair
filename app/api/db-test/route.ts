import { NextResponse } from "next/server";
import { testConnection, query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  // Step 1: Test database connection
  try {
    const connected = await testConnection();
    if (!connected) {
      return NextResponse.json({ 
        ok: false, 
        step: "db_connection", 
        error: "Failed to connect to PostgreSQL database" 
      });
    }
  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      step: "db_connection_error", 
      error: e?.message ?? String(e) 
    });
  }

  // Step 2: Test query execution
  try {
    const result = await query('SELECT COUNT(*) as count FROM products WHERE status = $1', ['approved']);
    const totalProducts = parseInt(result.rows[0].count);
    
    // Get sample products
    const sampleResult = await query(
      'SELECT id, product_name, status FROM products WHERE status = $1 LIMIT 3',
      ['approved']
    );
    
    return NextResponse.json({
      ok: true,
      totalProducts,
      sample: sampleResult.rows.map((p: any) => ({ 
        id: p.id, 
        name: p.product_name, 
        status: p.status 
      })),
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      step: "db_query",
      error: e?.message ?? String(e),
    });
  }
}
