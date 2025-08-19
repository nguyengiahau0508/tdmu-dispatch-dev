// Debug script để kiểm tra circular dependency
console.log('=== DEBUG CIRCULAR DEPENDENCY ===');

// Kiểm tra Angular DI container
console.log('Angular DI Status:');
console.log('  - Angular version:', (window as any).ng?.version || 'Unknown');

// Kiểm tra Apollo client
if (window.__APOLLO_CLIENT__) {
  console.log('Apollo Client Status:');
  console.log('  - Client exists:', !!window.__APOLLO_CLIENT__);
  console.log('  - Cache exists:', !!window.__APOLLO_CLIENT__.cache);
  console.log('  - Link exists:', !!window.__APOLLO_CLIENT__.link);
} else {
  console.log('Apollo Client Status: Not found');
}

// Kiểm tra services
console.log('Services Status:');
console.log('  - AuthState exists:', !!(window as any).ng?.getInjector?.()?.get?.('AuthState'));
console.log('  - UserState exists:', !!(window as any).ng?.getInjector?.()?.get?.('UserState'));

// Kiểm tra localStorage và sessionStorage
console.log('Storage Status:');
console.log('  - localStorage items:', localStorage.length);
console.log('  - sessionStorage items:', sessionStorage.length);

// Kiểm tra current page
console.log('Current Page:');
console.log('  - URL:', window.location.href);
console.log('  - Pathname:', window.location.pathname);

// Kiểm tra console errors
console.log('Console Errors:');
// Note: Check browser console for NG0200 errors

console.log('=== END DEBUG ===');

// Hướng dẫn debug circular dependency
console.log('=== CIRCULAR DEPENDENCY DEBUG INSTRUCTIONS ===');
console.log('1. Check browser console for NG0200 errors');
console.log('2. Look for circular dependency warnings');
console.log('3. Check if services are properly injected');
console.log('4. Verify Apollo client initialization');
console.log('5. Check if AuthStateManagerService is causing issues');
console.log('6. Look for dependency injection errors in console');
console.log('=== END INSTRUCTIONS ===');

// Helper function để kiểm tra service injection
function checkServiceInjection(serviceName: string) {
  try {
    // This is a simplified check - in real Angular app, you'd use injector
    console.log(`Service ${serviceName} injection check:`, 
      !!(window as any).ng?.getInjector?.()?.get?.(serviceName));
  } catch (error) {
    console.log(`Error checking ${serviceName}:`, error);
  }
}

// Check specific services
checkServiceInjection('AuthState');
checkServiceInjection('UserState');
checkServiceInjection('TokenRefreshHttpService');
checkServiceInjection('AuthStateManagerService');
