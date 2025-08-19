# Mô tả chi tiết - Sơ đồ tuần tự Quản lý Người dùng (User Management)

## Tổng quan

Sơ đồ tuần tự quản lý người dùng mô tả toàn bộ quy trình quản lý người dùng trong hệ thống TDMU Dispatch, từ tạo tài khoản, cập nhật thông tin, phân quyền đến vô hiệu hóa/kích hoạt tài khoản và phân công chức vụ.

## Các thành phần tham gia

### Actors
- **SYSTEM_ADMIN**: Quản trị viên hệ thống thực hiện các thao tác quản lý người dùng

### Participants
- **Frontend**: Giao diện người dùng (Angular)
- **UserService**: Service xử lý logic quản lý người dùng
- **AuthService**: Service xử lý xác thực và mật khẩu
- **AssignmentService**: Service quản lý phân công chức vụ
- **Database**: Cơ sở dữ liệu MySQL
- **MailService**: Service gửi email

## Chi tiết các use case

### 1. Tạo tài khoản người dùng

#### Mô tả
SYSTEM_ADMIN tạo một tài khoản người dùng mới trong hệ thống với thông tin cơ bản và phân quyền.

#### Luồng xử lý
1. **SYSTEM_ADMIN → Frontend**: Nhập thông tin người dùng (email, firstName, lastName, roles, position, unit)
2. **Frontend**: Validate form data (email format, required fields)
3. **Frontend → UserService**: Gọi API `createUser(createUserInput)`
4. **UserService**: Validate user data (email uniqueness, role validity)

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- UserService throw `BadRequestException`
- Frontend hiển thị lỗi validation

**Trường hợp 2: Validation passed**
- **Kiểm tra email uniqueness**:
  - UserService → Database: SELECT COUNT(*) FROM users WHERE email = ?
  - Database → UserService: Trả về count

  - **Nếu email đã tồn tại**:
    - UserService throw `BadRequestException`
    - Frontend hiển thị "Email đã tồn tại"

  - **Nếu email chưa tồn tại**:
    - **Tạo mật khẩu mặc định**:
      - UserService → AuthService: `hashPassword(defaultPassword)`
      - AuthService → UserService: Trả về hashedPassword

    - **Tạo user**:
      - UserService → Database: INSERT INTO users (email, firstName, lastName, passwordHash, roles, isActive, isFirstLogin)
      - Database → UserService: Trả về userId

    - **Phân công chức vụ (nếu có)**:
      - UserService → AssignmentService: `createAssignment(userId, positionId, unitId)`
      - AssignmentService → Database: INSERT INTO assignments (userId, positionId, unitId)
      - Database → AssignmentService: Trả về assignmentId
      - AssignmentService → UserService: Trả về assignment

    - **Gửi email chào mừng**:
      - UserService → MailService: `sendWelcomeEmail(user.email, defaultPassword)`
      - MailService → UserService: Success

    - **Kết quả**:
      - UserService → Frontend: Trả về User object
      - Frontend → SYSTEM_ADMIN: Hiển thị thông báo tạo user thành công

### 2. Cập nhật thông tin người dùng

#### Mô tả
SYSTEM_ADMIN cập nhật thông tin của một người dùng đã tồn tại trong hệ thống.

#### Luồng xử lý
1. **SYSTEM_ADMIN → Frontend**: Chọn user cần sửa
2. **Frontend → UserService**: Gọi API `getUserById(id)`
3. **UserService → Database**: SELECT * FROM users WHERE id = ?
4. **Database → UserService**: Trả về user data
5. **UserService → Frontend**: Trả về User object
6. **Frontend → SYSTEM_ADMIN**: Hiển thị form chỉnh sửa

7. **SYSTEM_ADMIN → Frontend**: Cập nhật thông tin
8. **Frontend → UserService**: Gọi API `updateUser(updateUserInput)`
9. **UserService**: Validate update data

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- UserService throw `BadRequestException`
- Frontend hiển thị lỗi validation

**Trường hợp 2: Validation passed**
- **Cập nhật thông tin cơ bản**:
  - UserService → Database: UPDATE users SET firstName = ?, lastName = ?, phoneNumber = ?, address = ? WHERE id = ?
  - Database → UserService: Success

- **Nếu có thay đổi email**:
  - UserService → Database: SELECT COUNT(*) FROM users WHERE email = ? AND id != ?
  - Database → UserService: Trả về count

    - **Nếu email đã tồn tại**:
      - UserService throw `BadRequestException`
      - Frontend hiển thị "Email đã tồn tại"

    - **Nếu email hợp lệ**:
      - UserService → Database: UPDATE users SET email = ? WHERE id = ?
      - Database → UserService: Success

- **Kết quả**:
  - UserService → Frontend: Trả về Updated user
  - Frontend → SYSTEM_ADMIN: Hiển thị thông báo cập nhật thành công

### 3. Phân quyền cho người dùng

#### Mô tả
SYSTEM_ADMIN phân quyền cho người dùng bằng cách gán các roles cụ thể.

#### Luồng xử lý
1. **SYSTEM_ADMIN → Frontend**: Chọn user và roles
2. **Frontend → UserService**: Gọi API `updateUserRoles(userId, roles)`
3. **UserService**: Validate roles (kiểm tra roles có hợp lệ không)

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- UserService throw `BadRequestException`
- Frontend hiển thị "Roles không hợp lệ"

**Trường hợp 2: Validation passed**
- **Cập nhật roles**:
  - UserService → Database: UPDATE users SET roles = ? WHERE id = ?
  - Database → UserService: Success

- **Clear user cache**:
  - UserService → UserService: `clearUserCache(userId)`

- **Kết quả**:
  - UserService → Frontend: Trả về Success response
  - Frontend → SYSTEM_ADMIN: Hiển thị thông báo phân quyền thành công

### 4. Vô hiệu hóa/Kích hoạt tài khoản

#### Mô tả
SYSTEM_ADMIN vô hiệu hóa hoặc kích hoạt tài khoản người dùng.

#### Luồng xử lý
1. **SYSTEM_ADMIN → Frontend**: Chọn user và action (enable/disable)
2. **Frontend → UserService**: Gọi API `toggleUserStatus(userId, isActive)`
3. **UserService → Database**: UPDATE users SET isActive = ? WHERE id = ?
4. **Database → UserService**: Success

#### Xử lý các trường hợp

**Trường hợp 1: Vô hiệu hóa tài khoản**
- UserService → UserService: `revokeAllUserTokens(userId)`
- UserService → Database: UPDATE tokens SET isRevoked = true WHERE userId = ?
- Database → UserService: Success
- UserService → Frontend: Trả về Success response
- Frontend → SYSTEM_ADMIN: Hiển thị "Đã vô hiệu hóa tài khoản"

**Trường hợp 2: Kích hoạt tài khoản**
- UserService → Frontend: Trả về Success response
- Frontend → SYSTEM_ADMIN: Hiển thị "Đã kích hoạt tài khoản"

### 5. Xem danh sách người dùng

#### Mô tả
SYSTEM_ADMIN xem danh sách tất cả người dùng trong hệ thống với phân trang.

#### Luồng xử lý
1. **SYSTEM_ADMIN → Frontend**: Truy cập trang quản lý users
2. **Frontend → UserService**: Gọi API `getUsersPaginated(pagination, filters)`
3. **UserService → Database**: SELECT * FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?
4. **Database → UserService**: Trả về users list
5. **UserService → Database**: SELECT COUNT(*) FROM users
6. **Database → UserService**: Trả về total count
7. **UserService → Frontend**: Trả về PaginatedResponse
8. **Frontend → SYSTEM_ADMIN**: Hiển thị danh sách users

### 6. Tìm kiếm người dùng

#### Mô tả
SYSTEM_ADMIN tìm kiếm người dùng theo từ khóa.

#### Luồng xử lý
1. **SYSTEM_ADMIN → Frontend**: Nhập từ khóa tìm kiếm
2. **Frontend → UserService**: Gọi API `searchUsers(keyword)`
3. **UserService → Database**: SELECT * FROM users WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ?
4. **Database → UserService**: Trả về users list
5. **UserService → Frontend**: Trả về Users array
6. **Frontend → SYSTEM_ADMIN**: Hiển thị kết quả tìm kiếm

### 7. Lọc người dùng theo role

#### Mô tả
SYSTEM_ADMIN lọc người dùng theo role cụ thể.

#### Luồng xử lý
1. **SYSTEM_ADMIN → Frontend**: Chọn role để lọc
2. **Frontend → UserService**: Gọi API `getUsersByRole(role)`
3. **UserService → Database**: SELECT * FROM users WHERE JSON_CONTAINS(roles, ?)
4. **Database → UserService**: Trả về users list
5. **UserService → Frontend**: Trả về Users array
6. **Frontend → SYSTEM_ADMIN**: Hiển thị danh sách users theo role

### 8. Phân công chức vụ

#### Mô tả
SYSTEM_ADMIN phân công chức vụ cho người dùng trong một đơn vị cụ thể.

#### Luồng xử lý
1. **SYSTEM_ADMIN → Frontend**: Chọn user và chức vụ
2. **Frontend → AssignmentService**: Gọi API `createAssignment(assignmentInput)`
3. **AssignmentService**: Validate assignment data

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- AssignmentService throw `BadRequestException`
- Frontend hiển thị lỗi validation

**Trường hợp 2: Validation passed**
- **Tạo assignment**:
  - AssignmentService → Database: INSERT INTO assignments (userId, positionId, unitId, startDate, endDate)
  - Database → AssignmentService: Trả về assignmentId
  - AssignmentService → Frontend: Trả về Assignment object
  - Frontend → SYSTEM_ADMIN: Hiển thị thông báo phân công thành công

### 9. Xem thông tin chi tiết user

#### Mô tả
SYSTEM_ADMIN xem thông tin chi tiết của một người dùng bao gồm thông tin cá nhân, phân công và hoạt động gần đây.

#### Luồng xử lý
1. **SYSTEM_ADMIN → Frontend**: Click vào user
2. **Frontend → UserService**: Gọi API `getUserDetail(id)`
3. **UserService → Database**: SELECT * FROM users WHERE id = ?
4. **Database → UserService**: Trả về user data
5. **UserService → Database**: SELECT * FROM assignments WHERE userId = ?
6. **Database → UserService**: Trả về assignments list
7. **UserService → Database**: SELECT * FROM user_activities WHERE userId = ? ORDER BY createdAt DESC LIMIT 10
8. **Database → UserService**: Trả về recent activities
9. **UserService → Frontend**: Trả về UserDetail object
10. **Frontend → SYSTEM_ADMIN**: Hiển thị thông tin chi tiết user

### 10. Đặt lại mật khẩu

#### Mô tả
SYSTEM_ADMIN đặt lại mật khẩu cho người dùng và gửi mật khẩu mới qua email.

#### Luồng xử lý
1. **SYSTEM_ADMIN → Frontend**: Chọn user và action "Reset Password"
2. **Frontend → UserService**: Gọi API `resetUserPassword(userId)`
3. **UserService → AuthService**: `generateTemporaryPassword()`
4. **AuthService → UserService**: Trả về tempPassword
5. **UserService → AuthService**: `hashPassword(tempPassword)`
6. **AuthService → UserService**: Trả về hashedPassword
7. **UserService → Database**: UPDATE users SET passwordHash = ?, isFirstLogin = true WHERE id = ?
8. **Database → UserService**: Success
9. **UserService → MailService**: `sendPasswordResetEmail(user.email, tempPassword)`
10. **MailService → UserService**: Success
11. **UserService → Frontend**: Trả về Success response
12. **Frontend → SYSTEM_ADMIN**: Hiển thị "Đã gửi mật khẩu mới qua email"

## Các đặc điểm kỹ thuật

### User Management
- **Role-based Access Control**: Quản lý quyền dựa trên roles
- **User Status Management**: Quản lý trạng thái active/inactive
- **Password Management**: Tạo và reset mật khẩu an toàn
- **Assignment Management**: Phân công chức vụ và đơn vị

### Database Design
- **Users Table**: Lưu thông tin người dùng
- **Assignments Table**: Lưu phân công chức vụ
- **User Activities Table**: Lưu hoạt động của user
- **Relationships**: One-to-many giữa User và Assignment

### Security
- **Password Hashing**: Sử dụng bcrypt để hash mật khẩu
- **Role Validation**: Kiểm tra tính hợp lệ của roles
- **Token Revocation**: Thu hồi token khi vô hiệu hóa user
- **Access Control**: Chỉ SYSTEM_ADMIN mới có quyền quản lý user

### Performance
- **Pagination**: Phân trang cho danh sách user
- **Caching**: Cache thông tin user và permissions
- **Indexing**: Index trên email và các trường tìm kiếm

## Các trường hợp đặc biệt

### User Status
- **Active**: User có thể đăng nhập và sử dụng hệ thống
- **Inactive**: User không thể đăng nhập, token bị revoke

### Role Management
- **Multiple Roles**: User có thể có nhiều roles
- **Role Hierarchy**: Roles có thứ bậc quyền
- **Role Validation**: Kiểm tra tính hợp lệ của roles

### Assignment Management
- **Multiple Assignments**: User có thể có nhiều phân công
- **Date Range**: Phân công có thời gian hiệu lực
- **Unit Hierarchy**: Phân công theo cấu trúc đơn vị

## Monitoring và Logging

### Audit Trail
- Log tất cả các thao tác CRUD trên user
- Lưu thông tin SYSTEM_ADMIN thực hiện action
- Track user activities và login attempts

### Metrics
- Số lượng user được tạo/updated/deactivated
- Số lượng role assignments
- User activity patterns

## Tích hợp với hệ thống

### Authentication Integration
- User status ảnh hưởng đến khả năng đăng nhập
- Role-based access control cho tất cả features
- Token management khi thay đổi user status

### Workflow Integration
- User roles ảnh hưởng đến workflow permissions
- Assignment ảnh hưởng đến workflow visibility
- User activities được track trong workflow

### Notification Integration
- Email notifications cho user management actions
- Thông báo khi user status thay đổi
- Welcome emails cho user mới

