const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testEndpoints() {
  console.log('🧪 Testing Backend Endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing /api/test...');
    const healthResponse = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Health Check:', healthResponse.data.message);

    // Test 2: CORS Test
    console.log('\n2. Testing /api/cors-test...');
    const corsResponse = await axios.get(`${BASE_URL}/cors-test`);
    console.log('✅ CORS Test:', corsResponse.data.message);

    // Test 3: Auth Test (should fail with invalid credentials)
    console.log('\n3. Testing /api/auth/signin with invalid credentials...');
    try {
      await axios.post(`${BASE_URL}/auth/signin`, {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('✅ Auth Test (expected failure):', error.response?.data?.message || 'Invalid credentials');
    }

    // Test 4: Auth Test (should work with valid credentials)
    console.log('\n4. Testing /api/auth/signin with valid credentials...');
    try {
      const authResponse = await axios.post(`${BASE_URL}/auth/signin`, {
        email: 'admin@test.com',
        password: 'admin123'
      });
      console.log('✅ Auth Test (success):', authResponse.data.message || 'Login successful');
    } catch (error) {
      console.log('❌ Auth Test (unexpected failure):', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEndpoints(); 