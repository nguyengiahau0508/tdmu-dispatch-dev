// Debug script để kiểm tra authentication flow
console.log('=== DEBUG AUTHENTICATION FLOW ===');

// Kiểm tra authentication state
console.log('Authentication State:');
const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');
const userData = localStorage.getItem('user');

console.log('  - Access Token exists:', !!accessToken);
console.log('  - Refresh Token exists:', !!refreshToken);
console.log('  - User data exists:', !!userData);

// Kiểm tra token validity
if (accessToken) {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const expirationTime = payload.exp;
    const timeRemaining = expirationTime - currentTime;
    
    console.log('Token Details:');
    console.log('  - Issued at:', new Date(payload.iat * 1000).toLocaleString());
    console.log('  - Expires at:', new Date(expirationTime * 1000).toLocaleString());
    console.log('  - Current time:', new Date(currentTime * 1000).toLocaleString());
    console.log('  - Time remaining (minutes):', Math.round(timeRemaining / 60));
    console.log('  - Is valid:', timeRemaining > 0);
    console.log('  - Is expiring soon (< 5 min):', timeRemaining < 300);
  } catch (error) {
    console.error('Error parsing token:', error);
  }
}

// Kiểm tra current page
console.log('Current Page:');
console.log('  - URL:', window.location.href);
console.log('  - Pathname:', window.location.pathname);
console.log('  - Is on login page:', window.location.pathname.includes('/auth/login'));

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

console.log('=== END DEBUG ===');

// Hướng dẫn debug authentication flow
console.log('=== AUTHENTICATION FLOW DEBUG INSTRUCTIONS ===');
console.log('1. Check if app initialization is running');
console.log('2. Check if token validation is working');
console.log('3. Check if refresh token logic is correct');
console.log('4. Check if redirect logic is working');
console.log('5. Check if user data loading is successful');
console.log('6. Check if auth layout is handling correctly');
console.log('=== END INSTRUCTIONS ===');

// Helper function để test authentication flow
function testAuthFlow() {
  console.log('=== AUTH FLOW TEST ===');
  
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  const isOnLoginPage = window.location.pathname.includes('/auth/login');
  
  console.log('Current State:');
  console.log('  - Has token:', !!token);
  console.log('  - Has user:', !!user);
  console.log('  - On login page:', isOnLoginPage);
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isValid = payload.exp > Date.now() / 1000;
      
      console.log('Token Status:');
      console.log('  - Is valid:', isValid);
      
      if (isValid && user && isOnLoginPage) {
        console.log('  - Action: Should redirect to home (user authenticated on login page)');
      } else if (!isValid && isOnLoginPage) {
        console.log('  - Action: Should stay on login page (invalid token)');
      } else if (!isValid && !isOnLoginPage) {
        console.log('  - Action: Should redirect to login (invalid token on protected page)');
      } else if (isValid && !user && !isOnLoginPage) {
        console.log('  - Action: Should load user data (valid token, no user data)');
      }
    } catch (error) {
      console.error('Error testing auth flow:', error);
    }
  } else {
    if (isOnLoginPage) {
      console.log('  - Action: Should stay on login page (no token)');
    } else {
      console.log('  - Action: Should redirect to login (no token on protected page)');
    }
  }
}

// Run test
testAuthFlow();
