// ==========================================
// Enhanced Health Check API Route
// GET /api/health - Comprehensive health check with DB connectivity
// ==========================================

import { NextResponse } from "next/server";
import { testConnection, query, getPool } from "@/lib/db";
import { validateEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: "healthy" | "unhealthy";
      message?: string;
      latency?: number;
    };
    environment: {
      status: "healthy" | "unhealthy";
      missing: string[];
    };
  };
  stats?: {
    brands: number;
    sources: number;
    products: number;
    images: number;
    users: number;
  };
}

// Cache health check results for 30 seconds
let cachedResult: { data: HealthStatus; timestamp: number } | null = null;
const CACHE_TTL = 30 * 1000; // 30 seconds

// Track server start time
const START_TIME = Date.now();

export async function GET() {
  const now = Date.now();
  
  // Return cached result if still valid
  if (cachedResult && (now - cachedResult.timestamp) < CACHE_TTL) {
    return NextResponse.json(cachedResult.data, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=30",
      },
    });
  }
  
  const healthStatus: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    uptime: Math.floor((now - START_TIME) / 1000), // uptime in seconds
    checks: {
      database: { status: "unhealthy" },
      environment: { status: "unhealthy", missing: [] },
    },
  };
  
  let statusCode = 200;
  
  try {
    // Check environment variables
    const envCheck = validateEnv();
    healthStatus.checks.environment = {
      status: envCheck.valid ? "healthy" : "unhealthy",
      missing: envCheck.missing,
    };
    
    if (!envCheck.valid) {
      healthStatus.status = "unhealthy";
      statusCode = 503;
    }
    
    // Test database connection with timing
    const dbStartTime = Date.now();
    const connected = await testConnection();
    const dbLatency = Date.now() - dbStartTime;
    
    healthStatus.checks.database = {
      status: connected ? "healthy" : "unhealthy",
      latency: dbLatency,
    };
    
    if (!connected) {
      healthStatus.status = "unhealthy";
      healthStatus.checks.database.message = "Database connection failed";
      statusCode = 503;
    } else if (dbLatency > 1000) {
      // Mark as degraded if DB latency is high
      healthStatus.status = healthStatus.status === "healthy" ? "degraded" : healthStatus.status;
      healthStatus.checks.database.message = `High latency: ${dbLatency}ms`;
    }
    
    // Get database stats if connected
    if (connected) {
      try {
        const [brandCount, sourceCount, productCount, imageCount, userCount] = await Promise.all([
          query("SELECT COUNT(*) FROM brands"),
          query("SELECT COUNT(*) FROM sources"),
          query("SELECT COUNT(*) FROM products"),
          query("SELECT COUNT(*) FROM images"),
          query("SELECT COUNT(*) FROM users"),
        ]);
        
        healthStatus.stats = {
          brands: parseInt(brandCount.rows[0].count),
          sources: parseInt(sourceCount.rows[0].count),
          products: parseInt(productCount.rows[0].count),
          images: parseInt(imageCount.rows[0].count),
          users: parseInt(userCount.rows[0].count),
        };
      } catch (statsError) {
        logger.warn("Failed to fetch database stats:", statsError);
      }
      
      // Check pool status
      const pool = getPool();
      healthStatus.checks.database.message = `Pool: ${pool.totalCount}/${pool.max} connections`;
    }
    
    // Cache the result
    cachedResult = { data: healthStatus, timestamp: now };
    
    return NextResponse.json(healthStatus, {
      status: statusCode,
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, max-age=30",
      },
    });
    
  } catch (error) {
    logger.error("Health check failed:", error);
    
    healthStatus.status = "unhealthy";
    healthStatus.checks.database = {
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Unknown error",
    };
    
    return NextResponse.json(healthStatus, { status: 503 });
  }
}

// Export runtime config for edge compatibility if needed
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
