# Mô tả chi tiết - Sơ đồ tuần tự Xác thực (Authentication)

## Tổng quan

Sơ đồ tuần tự xác thực mô tả toàn bộ quá trình đăng nhập và xác thực người dùng trong hệ thống TDMU Dispatch, bao gồm đăng nhập bằng mật khẩu, đăng nhập bằng OTP, gửi mã OTP và đặt lại mật khẩu.

## Các thành phần tham gia

### Actors
- **User**: Người dùng cuối thực hiện các thao tác đăng nhập

### Participants
- **Frontend**: Giao diện người dùng (Angular)
- **AuthService**: Service xử lý logic xác thực
- **UserService**: Service quản lý thông tin người dùng
- **TokenService**: Service quản lý JWT tokens
- **Database**: Cơ sở dữ liệu MySQL
- **Cache**: Redis cache cho OTP và session

## Chi tiết các use case

### 1. Đăng nhập bằng mật khẩu

#### Mô tả
Người dùng đăng nhập vào hệ thống bằng email và mật khẩu thông thường.

#### Luồng xử lý
1. **User → Frontend**: Nhập email và password
2. **Frontend → AuthService**: Gọi API `signIn(email, password)`
3. **AuthService → UserService**: Tìm user theo email
4. **UserService → Database**: Query `SELECT * FROM users WHERE email = ?`
5. **Database → UserService**: Trả về thông tin user
6. **UserService → AuthService**: Trả về user object

#### Xử lý các trường hợp

**Trường hợp 1: User không tồn tại**
- AuthService throw `BadRequestException`
- Frontend hiển thị lỗi "Tài khoản không tồn tại"

**Trường hợp 2: Mật khẩu sai**
- AuthService verify password với hash
- Throw `UnauthorizedException`
- Frontend hiển thị lỗi "Mật khẩu không đúng"

**Trường hợp 3: Lần đầu đăng nhập**
- Kiểm tra `isFirstLogin = true`
- Throw `FirstLoginChangePasswordRequired`
- Frontend chuyển đến trang OTP

**Trường hợp 4: Đăng nhập thành công**
- AuthService → TokenService: Tạo access token
- TokenService → AuthService: Trả về access token
- AuthService → Frontend: Trả về `SignInOutput`
- Frontend lưu token vào localStorage
- Frontend chuyển đến trang chính

### 2. Đăng nhập bằng OTP

#### Mô tả
Người dùng đăng nhập bằng mã OTP được gửi qua email, thường dùng cho lần đầu đăng nhập hoặc quên mật khẩu.

#### Luồng xử lý
1. **User → Frontend**: Nhập email và OTP
2. **Frontend → AuthService**: Gọi API `signInWithOtp(email, otp)`
3. **AuthService → UserService**: Tìm user theo email
4. **UserService → Database**: Query user
5. **Database → UserService**: Trả về user data
6. **AuthService → Cache**: Lấy OTP từ cache
7. **Cache → AuthService**: Trả về cached OTP

#### Xử lý các trường hợp

**Trường hợp 1: User không tồn tại**
- Throw `BadRequestException`
- Frontend hiển thị "Tài khoản không tồn tại"

**Trường hợp 2: OTP không hợp lệ**
- So sánh OTP nhập với cached OTP
- Throw `UnauthorizedException`
- Frontend hiển thị "Mã OTP không hợp lệ"

**Trường hợp 3: OTP hợp lệ**
- AuthService xóa OTP khỏi cache
- AuthService → TokenService: Tạo one-time access token
- TokenService → AuthService: Trả về access token
- AuthService → Frontend: Trả về `SignInOtpOutput`
- Frontend chuyển đến trang đặt lại mật khẩu

### 3. Gửi mã OTP

#### Mô tả
Hệ thống gửi mã OTP qua email cho người dùng để xác thực hoặc đặt lại mật khẩu.

#### Luồng xử lý
1. **User → Frontend**: Nhập email
2. **Frontend → AuthService**: Gọi API `sentOtp(email)`
3. **AuthService → UserService**: Tìm user theo email
4. **UserService → Database**: Query user
5. **Database → UserService**: Trả về user data

#### Xử lý các trường hợp

**Trường hợp 1: User không tồn tại**
- Throw `BadRequestException`
- Frontend hiển thị "Tài khoản không tồn tại"

**Trường hợp 2: User tồn tại**
- AuthService tạo OTP ngẫu nhiên 6 số
- AuthService → Cache: Lưu OTP với TTL 300 giây
- AuthService gửi email chứa OTP
- AuthService → Frontend: Trả về success response
- Frontend hiển thị "Mã OTP đã được gửi"

### 4. Đặt lại mật khẩu

#### Mô tả
Người dùng đặt lại mật khẩu mới sau khi xác thực bằng OTP.

#### Luồng xử lý
1. **User → Frontend**: Nhập mật khẩu mới
2. **Frontend → AuthService**: Gọi API `resetPassword(userId, newPassword)`
3. **AuthService**: Hash password mới
4. **AuthService → UserService**: Cập nhật password
5. **UserService → Database**: UPDATE password hash
6. **Database → UserService**: Xác nhận cập nhật
7. **AuthService**: Đặt `isFirstLogin = false`
8. **AuthService → Frontend**: Trả về success
9. **Frontend → User**: Chuyển đến trang chính

## Các đặc điểm kỹ thuật

### Bảo mật
- **Password Hashing**: Sử dụng bcrypt để hash mật khẩu
- **JWT Token**: Access token có thời hạn và có thể revoke
- **OTP Security**: OTP có TTL 5 phút, tự động xóa sau khi sử dụng
- **Rate Limiting**: Giới hạn số lần gửi OTP và đăng nhập

### Performance
- **Cache**: Sử dụng Redis để lưu OTP và session
- **Database Indexing**: Index trên email để tìm kiếm nhanh
- **Connection Pooling**: Tối ưu kết nối database

### Error Handling
- **Validation**: Validate input ở cả frontend và backend
- **Exception Handling**: Xử lý đầy đủ các trường hợp lỗi
- **User Feedback**: Thông báo lỗi rõ ràng cho người dùng

## Các trường hợp đặc biệt

### Lần đầu đăng nhập
- User được yêu cầu đổi mật khẩu mặc định
- Sử dụng OTP để xác thực
- Sau khi đổi mật khẩu, `isFirstLogin = false`

### Quên mật khẩu
- User yêu cầu gửi OTP
- Xác thực bằng OTP
- Đặt lại mật khẩu mới

### Token Expired
- Access token hết hạn
- User phải đăng nhập lại
- Refresh token không được sử dụng trong hệ thống này

## Monitoring và Logging

### Audit Trail
- Log tất cả các lần đăng nhập
- Lưu IP address và user agent
- Track failed login attempts

### Metrics
- Số lần đăng nhập thành công/thất bại
- Thời gian xử lý đăng nhập
- Số lượng OTP được gửi

## Tích hợp với hệ thống

### Workflow Integration
- Sau khi đăng nhập thành công, user có thể truy cập workflow
- Role-based access control dựa trên user roles

### Notification Integration
- Gửi email thông báo đăng nhập
- Thông báo bảo mật cho các hoạt động đáng ngờ

### Session Management
- JWT token được lưu trong localStorage
- Token được gửi trong header của mọi API request
- Automatic logout khi token hết hạn

