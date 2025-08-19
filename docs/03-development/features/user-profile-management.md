# Hệ thống Quản lý Profile Người dùng

## Tổng quan

Hệ thống quản lý profile người dùng trong TDMU Dispatch cung cấp các chức năng toàn diện để người dùng quản lý thông tin cá nhân, theo dõi hoạt động và tùy chỉnh cài đặt.

## Các chức năng chính

### 1. Quản lý thông tin cá nhân
- **Xem profile**: Người dùng có thể xem thông tin profile của mình
- **Cập nhật thông tin**: Cập nhật các thông tin cá nhân như họ tên, email, số điện thoại, địa chỉ, v.v.
- **Thông tin bổ sung**: Quản lý thông tin như ngày sinh, giới tính, chức danh, mô tả bản thân

### 2. Quản lý Avatar
- **Upload avatar**: Upload ảnh đại diện mới
- **Xóa avatar**: Xóa ảnh đại diện hiện tại
- **Tích hợp Google Drive**: Avatar được lưu trữ trên Google Drive để đảm bảo hiệu suất

### 3. Quản lý mạng xã hội
- **Liên kết mạng xã hội**: Quản lý các tài khoản LinkedIn, Facebook, Twitter
- **Website cá nhân**: Thêm website cá nhân

### 4. Cài đặt thông báo
- **Email notifications**: Bật/tắt thông báo qua email
- **Push notifications**: Bật/tắt thông báo push
- **Privacy settings**: Cài đặt quyền riêng tư cho profile

### 5. Theo dõi hoạt động
- **Lịch sử hoạt động**: Xem lịch sử các hoạt động trong hệ thống
- **Thống kê**: Thống kê số lần đăng nhập, loại hoạt động
- **Hoạt động gần đây**: Xem 5 hoạt động gần nhất

### 6. Bảo mật
- **Đổi mật khẩu**: Thay đổi mật khẩu tài khoản
- **Validation**: Kiểm tra tính hợp lệ của dữ liệu đầu vào
- **Audit trail**: Ghi log tất cả các thay đổi

## Cấu trúc Database

### Bảng `users` (mở rộng)
```sql
-- Các trường mới được thêm vào
phone_number VARCHAR(255)
address TEXT
date_of_birth VARCHAR(255)
gender VARCHAR(50)
job_title VARCHAR(255)
bio TEXT
website VARCHAR(500)
linkedin VARCHAR(255)
facebook VARCHAR(255)
twitter VARCHAR(255)
email_notifications BOOLEAN DEFAULT TRUE
push_notifications BOOLEAN DEFAULT TRUE
is_profile_public BOOLEAN DEFAULT TRUE
last_login_at TIMESTAMP
login_count INT DEFAULT 0
```

### Bảng `user_activities`
```sql
id INT PRIMARY KEY
user_id INT (FK to users.id)
activity_type ENUM(...)
description TEXT
metadata JSON
ip_address VARCHAR(45)
user_agent TEXT
created_at TIMESTAMP
```

## API Endpoints

### Queries
- `myProfile`: Lấy thông tin profile của user hiện tại
- `getUserActivities`: Lấy lịch sử hoạt động
- `profileStats`: Lấy thống kê profile

### Mutations
- `updateProfile`: Cập nhật thông tin profile
- `uploadAvatar`: Upload ảnh đại diện
- `removeAvatar`: Xóa ảnh đại diện
- `changePassword`: Đổi mật khẩu

## Các loại hoạt động được theo dõi

1. **LOGIN**: Đăng nhập vào hệ thống
2. **LOGOUT**: Đăng xuất khỏi hệ thống
3. **PROFILE_UPDATE**: Cập nhật thông tin profile
4. **PASSWORD_CHANGE**: Thay đổi mật khẩu
5. **AVATAR_UPDATE**: Cập nhật ảnh đại diện
6. **DOCUMENT_VIEW**: Xem tài liệu
7. **DOCUMENT_CREATE**: Tạo tài liệu mới
8. **DOCUMENT_UPDATE**: Cập nhật tài liệu
9. **DOCUMENT_DELETE**: Xóa tài liệu
10. **TASK_ASSIGNED**: Được giao nhiệm vụ
11. **TASK_COMPLETED**: Hoàn thành nhiệm vụ
12. **APPROVAL_REQUESTED**: Yêu cầu phê duyệt
13. **APPROVAL_APPROVED**: Phê duyệt
14. **APPROVAL_REJECTED**: Từ chối phê duyệt

## Bảo mật và Quyền riêng tư

### Validation
- Email phải có định dạng hợp lệ
- Website phải có URL hợp lệ
- Các trường bắt buộc được kiểm tra

### Privacy
- `isProfilePublic`: Kiểm soát việc hiển thị thông tin công khai
- Thông tin nhạy cảm không được expose qua GraphQL
- IP address và User Agent được ghi log để bảo mật

### Audit Trail
- Tất cả các thay đổi được ghi log với timestamp
- Metadata chứa thông tin chi tiết về thay đổi
- IP address và User Agent được lưu trữ

## Tích hợp với hệ thống hiện tại

### Authentication
- Tích hợp với JWT authentication
- Tự động ghi log hoạt động đăng nhập
- Cập nhật thông tin đăng nhập cuối

### File Management
- Tích hợp với Google Drive service
- Tích hợp với Files module
- Quản lý avatar files

### Notification System
- Tích hợp với Mail service
- Hỗ trợ email notifications
- Chuẩn bị cho push notifications

## Sử dụng

### Frontend Integration
```typescript
// Ví dụ sử dụng trong Angular
const updateProfile = (profileData: UpdateProfileInput) => {
  return this.apollo.mutate({
    mutation: UPDATE_PROFILE,
    variables: { input: profileData }
  });
};
```

### Backend Integration
```typescript
// Ví dụ sử dụng ProfileService
@Injectable()
export class SomeService {
  constructor(private profileService: ProfileService) {}

  async logUserAction(userId: number, action: string) {
    await this.profileService.logActivity(
      userId,
      ActivityType.DOCUMENT_VIEW,
      action
    );
  }
}
```

## Migration

Để triển khai hệ thống này, chạy migration:

```sql
-- Chạy file migration-user-profile-update.sql
```

## Testing

Sử dụng các GraphQL queries trong file `profile-queries.graphql` để test các chức năng.

## Tương lai

- [ ] Push notifications
- [ ] Profile analytics dashboard
- [ ] Social media integration
- [ ] Profile templates
- [ ] Advanced privacy controls
- [ ] Activity export functionality
