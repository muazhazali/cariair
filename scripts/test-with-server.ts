#!/usr/bin/env node
// Test with server check

const BASE_URL = 'http://localhost:3000';

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) {
        console.log('✅ Server is ready!\n');
        return true;
      }
    } catch (e) {
      process.stdout.write(`Waiting for server... (${i + 1}/${maxAttempts})\r`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Server did not start in time');
}

async function runTests() {
  try {
    await waitForServer();
    
    const results = [];
    
    // Test 1: Health
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      const data = await res.json();
      results.push({ name: 'Health Check', passed: res.ok, data });
      console.log('✅ Health Check');
    } catch (e) {
      results.push({ name: 'Health Check', passed: false, error: (e as Error).message });
      console.log('❌ Health Check:', (e as Error).message);
    }
    
    // Test 2: Products
    try {
      const res = await fetch(`${BASE_URL}/api/products`);
      const data = await res.json();
      results.push({ name: 'Products', passed: res.ok && data.items?.length > 0, count: data.items?.length });
      console.log(`✅ Products (${data.items?.length} items)`);
    } catch (e) {
      results.push({ name: 'Products', passed: false, error: (e as Error).message });
      console.log('❌ Products:', (e as Error).message);
    }
    
    // Test 3: Brands
    try {
      const res = await fetch(`${BASE_URL}/api/brands`);
      const data = await res.json();
      results.push({ name: 'Brands', passed: res.ok && data.brands?.length > 0, count: data.brands?.length });
      console.log(`✅ Brands (${data.brands?.length} items)`);
    } catch (e) {
      results.push({ name: 'Brands', passed: false, error: (e as Error).message });
      console.log('❌ Brands:', (e as Error).message);
    }
    
    // Test 4: Sources
    try {
      const res = await fetch(`${BASE_URL}/api/sources`);
      const data = await res.json();
      results.push({ name: 'Sources', passed: res.ok && data.sources?.length > 0, count: data.sources?.length });
      console.log(`✅ Sources (${data.sources?.length} items)`);
    } catch (e) {
      results.push({ name: 'Sources', passed: false, error: (e as Error).message });
      console.log('❌ Sources:', (e as Error).message);
    }
    
    console.log('\n' + '='.repeat(50));
    const passed = results.filter(r => r.passed).length;
    console.log(`${passed}/${results.length} tests passed`);
    
  } catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
  }
}

runTests();
