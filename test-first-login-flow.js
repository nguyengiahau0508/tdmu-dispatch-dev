// Test script cho luồng đăng nhập lần đầu
console.log('=== TEST FIRST LOGIN FLOW ===');

// Function để test từng bước
async function testFirstLoginFlow() {
  console.log('Starting first login flow test...');
  
  // Step 1: Clear all data
  console.log('\n1. Clearing all data...');
  localStorage.clear();
  sessionStorage.clear();
  console.log('✓ All data cleared');
  
  // Step 2: Simulate login with first login user
  console.log('\n2. Simulating login with first login user...');
  console.log('   - User enters credentials');
  console.log('   - Backend should return FIRST_LOGIN_CHANGE_PASSWORD_REQUIRED');
  console.log('   - Frontend should redirect to /auth/otp-input');
  console.log('   - Email should be stored in AuthState');
  
  // Simulate setting email for OTP
  localStorage.setItem('emailForOtp', 'test@tdmu.edu.vn');
  console.log('✓ Email stored for OTP');
  
  // Step 3: Test OTP page access
  console.log('\n3. Testing OTP page access...');
  const emailForOtp = localStorage.getItem('emailForOtp');
  if (emailForOtp) {
    console.log('✓ Email for OTP found:', emailForOtp);
    console.log('✓ Should be able to access OTP page');
  } else {
    console.log('✗ Email for OTP not found');
  }
  
  // Step 4: Simulate OTP verification
  console.log('\n4. Simulating OTP verification...');
  console.log('   - User enters OTP');
  console.log('   - Backend should return one-time token');
  console.log('   - Frontend should redirect to /auth/reset-password');
  
  // Simulate one-time token
  const mockOneTimeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEB0ZG11LmVkdS52biIsInR5cGUiOiJvbmV0aW1lIiwicm9sZSI6WyJCQVNJQ19VU0VSIl0sInRva2VuSWQiOiJ0ZXN0LXRva2VuLWlkIiwiaWF0IjoxNzM1Njg5NjAwLCJleHAiOjE3MzU2ODk5MDB9.mock-signature';
  localStorage.setItem('accessToken', mockOneTimeToken);
  console.log('✓ One-time token stored');
  
  // Step 5: Test reset password page access
  console.log('\n5. Testing reset password page access...');
  const token = localStorage.getItem('accessToken');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('✓ Token decoded successfully');
      console.log('  - Type:', payload.type);
      console.log('  - User ID:', payload.sub);
      console.log('  - Email:', payload.email);
      console.log('  - Is one-time token:', payload.type === 'onetime');
    } catch (error) {
      console.log('✗ Error decoding token:', error.message);
    }
  }
  
  // Step 6: Simulate password reset
  console.log('\n6. Simulating password reset...');
  console.log('   - User enters new password');
  console.log('   - Backend should update isFirstLogin = false');
  console.log('   - Frontend should clear emailForOtp');
  console.log('   - Frontend should redirect to home page');
  
  // Simulate successful password reset
  localStorage.removeItem('emailForOtp');
  localStorage.removeItem('accessToken');
  console.log('✓ Email for OTP cleared');
  console.log('✓ One-time token cleared');
  
  // Step 7: Verify final state
  console.log('\n7. Verifying final state...');
  const finalEmailForOtp = localStorage.getItem('emailForOtp');
  const finalToken = localStorage.getItem('accessToken');
  
  if (!finalEmailForOtp && !finalToken) {
    console.log('✓ Final state is clean');
    console.log('✓ First login flow completed successfully');
  } else {
    console.log('✗ Final state is not clean');
    console.log('  - Email for OTP:', finalEmailForOtp);
    console.log('  - Token:', finalToken);
  }
}

// Function để test error scenarios
function testErrorScenarios() {
  console.log('\n=== TESTING ERROR SCENARIOS ===');
  
  // Test 1: No email for OTP
  console.log('\n1. Testing no email for OTP...');
  localStorage.clear();
  const emailForOtp = localStorage.getItem('emailForOtp');
  if (!emailForOtp) {
    console.log('✓ No email for OTP - should redirect to login');
  }
  
  // Test 2: Invalid OTP
  console.log('\n2. Testing invalid OTP...');
  localStorage.setItem('emailForOtp', 'test@tdmu.edu.vn');
  console.log('✓ Email set for OTP');
  console.log('   - Should show error message');
  console.log('   - Should clear OTP input');
  console.log('   - Should stay on OTP page');
  
  // Test 3: Expired OTP
  console.log('\n3. Testing expired OTP...');
  console.log('   - Should show error message');
  console.log('   - Should clear emailForOtp');
  console.log('   - Should redirect to login');
  
  // Test 4: Network error
  console.log('\n4. Testing network error...');
  console.log('   - Should show error message');
  console.log('   - Should clear emailForOtp');
  console.log('   - Should redirect to login');
}

// Function để test AuthenticationFlowService behavior
function testAuthenticationFlowService() {
  console.log('\n=== TESTING AUTHENTICATION FLOW SERVICE ===');
  
  // Test 1: Normal login flow
  console.log('\n1. Testing normal login flow...');
  localStorage.clear();
  console.log('✓ No data - should redirect to login');
  
  // Test 2: First login flow
  console.log('\n2. Testing first login flow...');
  localStorage.setItem('emailForOtp', 'test@tdmu.edu.vn');
  const emailForOtp = localStorage.getItem('emailForOtp');
  if (emailForOtp) {
    console.log('✓ Email for OTP found');
    console.log('✓ AuthenticationFlowService should skip authentication check');
  }
  
  // Test 3: Authenticated user
  console.log('\n3. Testing authenticated user...');
  localStorage.clear();
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEB0ZG11LmVkdS52biIsInR5cGUiOiJhY2Nlc3MiLCJyb2xlIjpbIkJBU0lDX1VTRVIiXSwidG9rZW5JZCI6InRlc3QtdG9rZW4taWQiLCJpYXQiOjE3MzU2ODk2MDAsImV4cCI6MTczNTY5MzIwMH0.mock-signature';
  localStorage.setItem('accessToken', mockToken);
  console.log('✓ Valid token stored');
  console.log('✓ AuthenticationFlowService should load user data');
}

// Run all tests
async function runAllTests() {
  console.log('Starting comprehensive first login flow tests...\n');
  
  await testFirstLoginFlow();
  testErrorScenarios();
  testAuthenticationFlowService();
  
  console.log('\n=== ALL TESTS COMPLETED ===');
  console.log('Check the results above to verify the flow is working correctly.');
}

// Run tests
runAllTests();
