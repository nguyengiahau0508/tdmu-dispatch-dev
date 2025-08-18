// Debug script để kiểm tra token validation
console.log('=== DEBUG TOKEN VALIDATION ===');

// Kiểm tra access token
const accessToken = localStorage.getItem('accessToken');
console.log('Access Token Status:');
console.log('  - Exists:', !!accessToken);
console.log('  - Length:', accessToken ? accessToken.length : 0);

if (accessToken) {
  try {
    // Decode JWT để kiểm tra
    const parts = accessToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      const expirationTime = payload.exp;
      const timeRemaining = expirationTime - currentTime;
      
      console.log('Token Details:');
      console.log('  - Issued at:', new Date(payload.iat * 1000).toLocaleString());
      console.log('  - Expires at:', new Date(expirationTime * 1000).toLocaleString());
      console.log('  - Current time:', new Date(currentTime * 1000).toLocaleString());
      console.log('  - Time remaining (seconds):', Math.round(timeRemaining));
      console.log('  - Time remaining (minutes):', Math.round(timeRemaining / 60));
      console.log('  - Is valid:', timeRemaining > 0);
      console.log('  - Is expiring soon (< 5 min):', timeRemaining < 300);
      
      // Kiểm tra payload
      console.log('Token Payload:');
      console.log('  - Subject (user ID):', payload.sub);
      console.log('  - Email:', payload.email);
      console.log('  - Role:', payload.role);
      console.log('  - Token ID:', payload.tokenId);
      console.log('  - Type:', payload.type);
    } else {
      console.log('Invalid token format (should have 3 parts)');
    }
  } catch (error) {
    console.error('Error parsing token:', error);
  }
}

// Kiểm tra refresh token
const refreshToken = localStorage.getItem('refreshToken');
console.log('Refresh Token Status:');
console.log('  - Exists:', !!refreshToken);
console.log('  - Length:', refreshToken ? refreshToken.length : 0);

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

// Kiểm tra current page
console.log('Current Page:');
console.log('  - URL:', window.location.href);
console.log('  - Pathname:', window.location.pathname);

// Kiểm tra authentication state
console.log('Auth State Check:');
console.log('  - Has access token:', !!localStorage.getItem('accessToken'));
console.log('  - Has refresh token:', !!localStorage.getItem('refreshToken'));
console.log('  - Is on login page:', window.location.pathname.includes('/auth/login'));

console.log('=== END DEBUG ===');

// Hướng dẫn debug token validation
console.log('=== TOKEN VALIDATION DEBUG INSTRUCTIONS ===');
console.log('1. Check if token is expired');
console.log('2. Check if token is malformed');
console.log('3. Check if refresh token exists');
console.log('4. Check if user should be redirected to login');
console.log('5. Check if token refresh should be attempted');
console.log('6. Check if force logout should be triggered');
console.log('=== END INSTRUCTIONS ===');

// Helper function để test token validation
function testTokenValidation() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.log('No token to test');
    return;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const isValid = payload.exp > currentTime;
    const timeRemaining = payload.exp - currentTime;
    const shouldRefresh = timeRemaining < 300; // 5 minutes
    
    console.log('Token Validation Test:');
    console.log('  - Is valid:', isValid);
    console.log('  - Should refresh:', shouldRefresh);
    console.log('  - Time remaining (min):', Math.round(timeRemaining / 60));
    
    if (!isValid) {
      console.log('  - Action: Force logout (token expired)');
    } else if (shouldRefresh) {
      console.log('  - Action: Refresh token (expiring soon)');
    } else {
      console.log('  - Action: Continue (token valid)');
    }
  } catch (error) {
    console.error('Error testing token validation:', error);
  }
}

// Run test
testTokenValidation();
