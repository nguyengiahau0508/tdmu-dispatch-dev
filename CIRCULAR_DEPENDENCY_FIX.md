# Circular Dependency Fix Summary

## Vấn đề đã được xác định

### 🔄 **Circular Dependency trong DI**
- **Lỗi**: `NG0200: Circular dependency in DI detected for _Apollo`
- **Nguyên nhân**: `AuthStateManagerService` inject `Apollo`, nhưng `apollo-options.factory.ts` lại inject `AuthStateManagerService`
- **Hậu quả**: Angular không thể khởi tạo services

## Giải pháp đã áp dụng

### 1. **Loại bỏ Apollo dependency từ AuthStateManagerService**
- **File**: `auth-state-manager.service.ts`
- **Thay đổi**: Remove `Apollo` injection
- **Giải pháp**: Tạo method `clearApolloCache(apolloClient)` để nhận client từ bên ngoài

### 2. **Cập nhật AuthService để xử lý Apollo cache**
- **File**: `auth.service.ts`
- **Thay đổi**: Gọi `clearApolloCache()` với Apollo client instance
- **Mục đích**: Tránh circular dependency nhưng vẫn clear cache

### 3. **Cập nhật apollo-options.factory.ts**
- **File**: `apollo-options.factory.ts`
- **Thay đổi**: Loại bỏ `AuthStateManagerService` injection
- **Giải pháp**: Tạo local `forceLogout()` function

## Files đã được sửa

### Frontend
1. **`auth-state-manager.service.ts`**
   - Remove Apollo injection
   - Add `clearApolloCache()` method
   - Simplified dependency chain

2. **`auth.service.ts`**
   - Call `clearApolloCache()` with Apollo client
   - Maintain logout functionality
   - No circular dependency

3. **`apollo-options.factory.ts`**
   - Remove AuthStateManagerService injection
   - Add local `forceLogout()` function
   - Direct logout handling

## Dependency Chain (Sau khi sửa)

### ✅ **Không có circular dependency**
```
AuthService → AuthStateManagerService → AuthState, UserState, TokenRefreshHttpService
AuthService → Apollo (for cache clearing)
apollo-options.factory → AuthState, TokenRefreshHttpService (local forceLogout)
```

### ❌ **Trước khi sửa (có circular dependency)**
```
AuthService → AuthStateManagerService → Apollo
apollo-options.factory → AuthStateManagerService → Apollo
```

## Cách test fix

### 1. **Test application startup**
```bash
# Khởi động ứng dụng
# Kiểm tra không có NG0200 error
# Verify services load properly
```

### 2. **Test logout functionality**
```bash
# Đăng nhập
# Click logout
# Verify Apollo cache cleared
# Verify redirect to login
```

### 3. **Test error handling**
```bash
# Trigger auth error
# Verify force logout works
# Check no circular dependency errors
```

## Debug tools

### 1. **Console debug script**
```javascript
// Chạy trong browser console
// File: debug-circular-dependency.js
```

### 2. **Angular DI inspection**
```javascript
// Kiểm tra service injection
console.log('Services loaded:', !!(window as any).ng?.getInjector?.()?.get?.('AuthState'));
```

### 3. **Apollo client check**
```javascript
// Kiểm tra Apollo client
console.log('Apollo client:', !!window.__APOLLO_CLIENT__);
```

## Best practices đã áp dụng

1. **Dependency isolation**: Tách biệt Apollo dependency
2. **Service composition**: Sử dụng composition thay vì inheritance
3. **Lazy injection**: Inject dependencies khi cần thiết
4. **Error prevention**: Tránh circular dependency từ đầu
5. **Clean architecture**: Tách biệt concerns

## Monitoring

### Console logs để theo dõi
- `"Force logout from Apollo error handler"`
- `"Apollo cache cleared"`
- `"Force logout initiated..."`
- `"All local data cleared"`

### Warning signs
- NG0200 errors
- Service injection failures
- Apollo client not found
- Circular dependency warnings

## Troubleshooting

### Nếu vẫn còn circular dependency
1. Check service injection order
2. Verify no hidden dependencies
3. Use Angular's dependency injection debugger
4. Check for lazy-loaded modules

### Nếu logout không hoạt động
1. Check Apollo cache clearing
2. Verify localStorage clearing
3. Check redirect logic
4. Monitor console logs

## Prevention

### Để tránh circular dependency trong tương lai
1. **Design services với single responsibility**
2. **Sử dụng dependency injection carefully**
3. **Tránh inject services vào factory functions**
4. **Use composition over inheritance**
5. **Test dependency injection early**
