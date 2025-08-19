// Debug script để kiểm tra luồng đăng nhập lần đầu
console.log('=== DEBUG FIRST LOGIN FLOW ===');

// Kiểm tra authentication state
console.log('Authentication State:');
const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');
const userData = localStorage.getItem('user');
const emailForOtp = localStorage.getItem('emailForOtp');

console.log('  - Access Token exists:', !!accessToken);
console.log('  - Refresh Token exists:', !!refreshToken);
console.log('  - User data exists:', !!userData);
console.log('  - Email for OTP exists:', !!emailForOtp);

// Kiểm tra current page
console.log('Current Page:');
console.log('  - URL:', window.location.href);
console.log('  - Pathname:', window.location.pathname);
console.log('  - Is on login page:', window.location.pathname.includes('/auth/login'));
console.log('  - Is on OTP page:', window.location.pathname.includes('/auth/otp-input'));
console.log('  - Is on reset password page:', window.location.pathname.includes('/auth/reset-password'));

// Kiểm tra sessionStorage
console.log('Session Storage:');
console.log('  - Items count:', sessionStorage.length);
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  console.log(`  - ${key}:`, sessionStorage.getItem(key));
}

// Kiểm tra cookies
console.log('Cookies:');
console.log('  - All cookies:', document.cookie);

// Kiểm tra localStorage
console.log('Local Storage:');
console.log('  - Items count:', localStorage.length);
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`  - ${key}:`, localStorage.getItem(key));
}

console.log('=== END DEBUG ===');

// Hướng dẫn debug luồng đăng nhập lần đầu
console.log('=== FIRST LOGIN FLOW DEBUG INSTRUCTIONS ===');
console.log('1. Check if user is in first login state (isFirstLogin = true)');
console.log('2. Check if OTP was sent to user email');
console.log('3. Check if AuthenticationFlowService is interfering with OTP flow');
console.log('4. Check if emailForOtp is properly stored');
console.log('5. Check if navigation between login -> OTP -> reset-password works');
console.log('6. Check if one-time token is working correctly');
console.log('=== END INSTRUCTIONS ===');

// Helper function để test first login flow
function testFirstLoginFlow() {
  console.log('=== FIRST LOGIN FLOW TEST ===');
  
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  const emailForOtp = localStorage.getItem('emailForOtp');
  const isOnLoginPage = window.location.pathname.includes('/auth/login');
  const isOnOtpPage = window.location.pathname.includes('/auth/otp-input');
  const isOnResetPage = window.location.pathname.includes('/auth/reset-password');
  
  console.log('Current State:');
  console.log('  - Has token:', !!token);
  console.log('  - Has user:', !!user);
  console.log('  - Has email for OTP:', !!emailForOtp);
  console.log('  - On login page:', isOnLoginPage);
  console.log('  - On OTP page:', isOnOtpPage);
  console.log('  - On reset password page:', isOnResetPage);
  
  // Kiểm tra token nếu có
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token Details:');
      console.log('  - Type:', payload.type);
      console.log('  - Is one-time token:', payload.type === 'onetime');
      console.log('  - User ID:', payload.sub);
      console.log('  - Email:', payload.email);
      console.log('  - Expires at:', new Date(payload.exp * 1000).toLocaleString());
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }
  
  // Phân tích trạng thái
  if (!token && !user && !emailForOtp && isOnLoginPage) {
    console.log('  - Status: Normal login state');
  } else if (!token && !user && emailForOtp && isOnOtpPage) {
    console.log('  - Status: First login - OTP verification state');
  } else if (token && !user && emailForOtp && isOnResetPage) {
    console.log('  - Status: First login - Password reset state');
  } else if (token && user && !emailForOtp && !isOnLoginPage) {
    console.log('  - Status: Normal authenticated state');
  } else {
    console.log('  - Status: Unexpected state - potential issue');
  }
}

// Run test
testFirstLoginFlow();

// Function để simulate first login flow
function simulateFirstLoginFlow() {
  console.log('=== SIMULATE FIRST LOGIN FLOW ===');
  
  // Step 1: Clear all data
  localStorage.clear();
  sessionStorage.clear();
  console.log('1. Cleared all data');
  
  // Step 2: Simulate login with first login user
  console.log('2. Simulate login with first login user');
  console.log('   - Backend should return FIRST_LOGIN_CHANGE_PASSWORD_REQUIRED');
  console.log('   - Frontend should redirect to /auth/otp-input');
  console.log('   - Email should be stored in AuthState');
  
  // Step 3: Simulate OTP verification
  console.log('3. Simulate OTP verification');
  console.log('   - User enters OTP');
  console.log('   - Backend should return one-time token');
  console.log('   - Frontend should redirect to /auth/reset-password');
  
  // Step 4: Simulate password reset
  console.log('4. Simulate password reset');
  console.log('   - User enters new password');
  console.log('   - Backend should update isFirstLogin = false');
  console.log('   - Frontend should redirect to home page');
}

// Run simulation
simulateFirstLoginFlow();
