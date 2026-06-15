// Export products as JSON
import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/db/products';

export async function GET() {
  try {
    const result = await getProducts(undefined, { limit: 1000, offset: 0 });
    const products = result.items;

    // Create JSON export with metadata
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        total: products.length,
        version: '1.0.0',
        source: 'CariAir - Malaysia Mineral & Drinking Water Source Registry',
        url: 'https://cariair.my',
      },
      products: products.map((product) => ({
        id: product.id,
        productName: product.product_name,
        barcode: product.barcode,
        phLevel: product.ph_level,
        tds: product.tds,
        status: product.status,
        minerals: product.minerals_json,
        brand: product.brand
          ? {
              id: product.brand.id,
              name: product.brand.brand_name,
              parentCompany: product.brand.parent_company,
              websiteUrl: product.brand.website_url,
            }
          : null,
        manufacturer: product.manufacturer
          ? {
              id: product.manufacturer.id,
              name: product.manufacturer.name,
              address: product.manufacturer.address,
            }
          : null,
        source: product.source
          ? {
              id: product.source.id,
              name: product.source.source_name,
              type: product.source.type,
              location: product.source.location_address,
              coordinates: {
                lat: product.source.lat,
                lng: product.source.lng,
              },
              kkmApprovalNumber: product.source.kkm_approval_number,
              country: product.source.country,
            }
          : null,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      })),
    };

    // Set headers for file download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="cariair-products.json"',
      },
    });
  } catch (error) {
    console.error('Error exporting JSON:', error);
    return NextResponse.json(
      { error: 'Failed to export products' },
      { status: 500 }
    );
  }
}
