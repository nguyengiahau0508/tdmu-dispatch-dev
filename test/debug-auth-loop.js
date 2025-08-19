// Debug script để kiểm tra vòng lặp authentication
console.log('=== DEBUG AUTH LOOP ===');

// Kiểm tra authentication state
console.log('Auth State:');
console.log('  - Access Token exists:', !!localStorage.getItem('accessToken'));
console.log('  - Refresh Token exists:', !!localStorage.getItem('refreshToken'));

// Kiểm tra Apollo client
if (window.__APOLLO_CLIENT__) {
  console.log('Apollo Client exists');
  try {
    const client = window.__APOLLO_CLIENT__;
    console.log('  - Cache size:', Object.keys(client.cache.extract()).length);
    console.log('  - Link chain:', client.link);
  } catch (error) {
    console.log('Error accessing Apollo client:', error);
  }
} else {
  console.log('No Apollo client found');
}

// Kiểm tra network requests
console.log('Network Status:');
console.log('  - Online:', navigator.onLine);
console.log('  - Connection type:', navigator.connection?.effectiveType || 'unknown');

// Kiểm tra console errors
console.log('Recent Console Errors:');
// Note: This won't capture existing errors, but you can check browser dev tools

// Kiểm tra localStorage và sessionStorage
console.log('Storage Status:');
console.log('  - localStorage items:', localStorage.length);
console.log('  - sessionStorage items:', sessionStorage.length);

// Kiểm tra cookies
console.log('Cookies:');
console.log('  - All cookies:', document.cookie);

// Kiểm tra current page
console.log('Current Page:');
console.log('  - URL:', window.location.href);
console.log('  - Pathname:', window.location.pathname);

// Kiểm tra authentication services
console.log('Auth Services Status:');
// Note: You can add more specific checks here

console.log('=== END DEBUG ===');

// Hướng dẫn debug
console.log('=== DEBUG INSTRUCTIONS ===');
console.log('1. Check browser console for repeated error messages');
console.log('2. Check Network tab for failed requests');
console.log('3. Check if token refresh is happening repeatedly');
console.log('4. Check if logout process is stuck');
console.log('5. Try clearing all storage and cookies manually');
console.log('6. Check if backend is responding correctly');
console.log('=== END INSTRUCTIONS ===');
