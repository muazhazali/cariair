import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

// Standalone test - does NOT use the shared pb singleton
// so we can isolate exactly what fails on Vercel
export async function GET() {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL;

  if (!url) {
    return NextResponse.json({ ok: false, step: "env", error: "NEXT_PUBLIC_POCKETBASE_URL is not set" });
  }

  // Step 1: raw fetch to health endpoint
  try {
    const health = await fetch(`${url}/api/health`, { cache: "no-store" });
    if (!health.ok) {
      return NextResponse.json({ ok: false, step: "health", status: health.status, url });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, step: "health_fetch", error: e?.message ?? String(e), url });
  }

  // Step 2: PocketBase SDK init + list collections
  let pb: PocketBase;
  try {
    pb = new PocketBase(url);
    pb.autoCancellation(false);
  } catch (e: any) {
    return NextResponse.json({ ok: false, step: "pb_init", error: e?.message ?? String(e) });
  }

  // Step 3: fetch products with no filter
  try {
    const result = await pb.collection("products").getList(1, 3, { requestKey: null });
    return NextResponse.json({
      ok: true,
      url,
      totalProducts: result.totalItems,
      sample: result.items.map((p: any) => ({ id: p.id, name: p.product_name, status: p.status })),
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      step: "pb_fetch_no_filter",
      error: e?.message ?? String(e),
      status: e?.status,
      data: e?.data,
      url,
    });
  }
}
