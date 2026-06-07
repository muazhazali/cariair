#!/usr/bin/env node
// ==========================================
// Application Testing Script
// ==========================================

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  data?: any;
}

async function runTest(name: string, fn: () => Promise<any>): Promise<TestResult> {
  try {
    const data = await fn();
    console.log(`✅ ${name}`);
    return { name, passed: true, data };
  } catch (error) {
    console.log(`❌ ${name}: ${(error as Error).message}`);
    return { name, passed: false, error: (error as Error).message };
  }
}

async function testHealth() {
  const response = await fetch(`${BASE_URL}/api/health`);
  if (!response.ok) throw new Error(`Status ${response.status}`);
  return response.json();
}

async function testProducts() {
  const response = await fetch(`${BASE_URL}/api/products`);
  if (!response.ok) throw new Error(`Status ${response.status}`);
  const data = await response.json();
  if (!data.items || data.items.length === 0) throw new Error('No products returned');
  return data;
}

async function testProductById() {
  // First get a product ID
  const productsRes = await fetch(`${BASE_URL}/api/products`);
  const productsData = await productsRes.json();
  if (!productsData.items?.[0]?.id) throw new Error('No products to test');
  
  const id = productsData.items[0].id;
  const response = await fetch(`${BASE_URL}/api/products/${id}`);
  if (!response.ok) throw new Error(`Status ${response.status}`);
  return response.json();
}

async function testBrands() {
  const response = await fetch(`${BASE_URL}/api/brands`);
  if (!response.ok) throw new Error(`Status ${response.status}`);
  const data = await response.json();
  if (!data.brands || data.brands.length === 0) throw new Error('No brands returned');
  return data;
}

async function testSources() {
  const response = await fetch(`${BASE_URL}/api/sources`);
  if (!response.ok) throw new Error(`Status ${response.status}`);
  const data = await response.json();
  if (!data.sources || data.sources.length === 0) throw new Error('No sources returned');
  return data;
}

async function testImages() {
  // First get a product with images
  const productsRes = await fetch(`${BASE_URL}/api/products`);
  const productsData = await productsRes.json();
  
  const productWithImage = productsData.items?.find((p: any) => p.images?.length > 0);
  if (!productWithImage) throw new Error('No products with images');
  
  const imageId = productWithImage.images[0].id || productWithImage.images[0];
  const response = await fetch(`${BASE_URL}/api/images/${imageId}`);
  if (!response.ok) throw new Error(`Status ${response.status}`);
  
  // Check content type
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('image')) throw new Error(`Not an image: ${contentType}`);
  
  return { imageId, contentType, size: (await response.blob()).size };
}

async function testFilters() {
  // Test filtering by brand
  const brandsRes = await fetch(`${BASE_URL}/api/brands`);
  const brandsData = await brandsRes.json();
  if (!brandsData.brands?.[0]?.id) throw new Error('No brands to filter by');
  
  const brandId = brandsData.brands[0].id;
  const response = await fetch(`${BASE_URL}/api/products?brands=${brandId}`);
  if (!response.ok) throw new Error(`Status ${response.status}`);
  return response.json();
}

async function runAllTests() {
  console.log('🧪 Testing CariAir Application\n');
  console.log('=' .repeat(50));
  
  const results: TestResult[] = [];
  
  // Test 1: Health Check
  results.push(await runTest('Health Check', testHealth));
  
  // Test 2: Products API
  results.push(await runTest('List Products', testProducts));
  
  // Test 3: Product by ID
  results.push(await runTest('Product by ID', testProductById));
  
  // Test 4: Brands API
  results.push(await runTest('List Brands', testBrands));
  
  // Test 5: Sources API
  results.push(await runTest('List Sources', testSources));
  
  // Test 6: Images
  results.push(await runTest('Image Serving', testImages));
  
  // Test 7: Filters
  results.push(await runTest('Product Filters', testFilters));
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:\n');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(r => {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} ${r.name}`);
  });
  
  console.log(`\n${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Migration successful!');
  } else {
    console.log(`\n⚠️ ${total - passed} test(s) failed`);
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
