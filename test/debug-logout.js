// Debug script để kiểm tra trạng thái logout
console.log('=== DEBUG LOGOUT STATUS ===');

// Kiểm tra localStorage
console.log('localStorage items:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`  ${key}: ${localStorage.getItem(key)}`);
}

// Kiểm tra sessionStorage
console.log('sessionStorage items:');
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  console.log(`  ${key}: ${sessionStorage.getItem(key)}`);
}

// Kiểm tra cookies
console.log('Cookies:');
console.log(document.cookie);

// Kiểm tra Apollo cache (nếu có)
if (window.__APOLLO_CLIENT__) {
  console.log('Apollo cache exists');
  try {
    const cache = window.__APOLLO_CLIENT__.cache;
    console.log('Apollo cache data:', cache.extract());
  } catch (error) {
    console.log('Error accessing Apollo cache:', error);
  }
} else {
  console.log('No Apollo client found');
}

// Kiểm tra current URL
console.log('Current URL:', window.location.href);

// Kiểm tra authentication state
console.log('=== AUTH STATE CHECK ===');
console.log('Access Token exists:', !!localStorage.getItem('accessToken'));
console.log('Refresh Token exists:', !!localStorage.getItem('refreshToken'));

console.log('=== END DEBUG ===');
