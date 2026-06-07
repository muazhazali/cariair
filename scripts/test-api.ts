// ==========================================
// Test API Endpoints
// ==========================================

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(path: string, label: string) {
  console.log(`\nTesting: ${label}`);
  console.log(`URL: ${BASE_URL}${path}`);
  
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    const status = response.status;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Status: ${status}`);
      console.log('Response:', JSON.stringify(data, null, 2).slice(0, 500));
      return true;
    } else {
      console.log(`❌ Status: ${status}`);
      const text = await response.text();
      console.log('Error:', text.slice(0, 200));
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${(error as Error).message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing API Endpoints\n');
  console.log('=' .repeat(50));

  const results = [];

  // Test health
  results.push({
    name: 'Health',
    success: await testEndpoint('/api/health', 'Health Check')
  });

  // Test products
  results.push({
    name: 'Products',
    success: await testEndpoint('/api/products', 'List Products')
  });

  // Test brands
  results.push({
    name: 'Brands',
    success: await testEndpoint('/api/brands', 'List Brands')
  });

  // Test sources
  results.push({
    name: 'Sources',
    success: await testEndpoint('/api/sources', 'List Sources')
  });

  // Test manufacturers
  results.push({
    name: 'Manufacturers',
    success: await testEndpoint('/api/manufacturers', 'List Manufacturers')
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:\n');
  
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    console.log(`  ${icon} ${r.name}`);
  });

  const passed = results.filter(r => r.success).length;
  console.log(`\n${passed}/${results.length} tests passed`);

  if (passed === results.length) {
    console.log('\n🎉 All tests passed! Migration successful!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above.');
    process.exit(1);
  }
}

runTests().catch(console.error);
