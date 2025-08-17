# Users Module - Profile Management System

## Tổng quan

Module Users cung cấp hệ thống quản lý profile người dùng hoàn chỉnh với các chức năng:

- Quản lý thông tin cá nhân
- Upload và quản lý avatar
- Theo dõi hoạt động người dùng
- Cài đặt thông báo và quyền riêng tư
- Thống kê và báo cáo

## Cấu trúc Module

```
users/
├── entities/
│   ├── user.entity.ts              # User entity (đã mở rộng)
│   └── user-activity.entity.ts     # User activity entity
├── dto/
│   ├── update-profile/             # Profile update DTOs
│   ├── get-user-activities/        # Activity query DTOs
│   └── upload-avatar/              # Avatar upload DTOs
├── services/
│   ├── users.service.ts            # Core user service
│   └── profile.service.ts          # Profile management service
├── resolvers/
│   ├── users.resolver.ts           # Core user resolver
│   └── profile.resolver.ts         # Profile management resolver
└── users.module.ts                 # Module configuration
```

## Cài đặt và Triển khai

### 1. Chạy Migration

```bash
# Chạy migration để cập nhật database
mysql -u your_user -p your_database < database/migrations/migration-user-profile-update.sql
```

### 2. Cập nhật Dependencies

Đảm bảo các module sau đã được import trong `users.module.ts`:

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserActivity]), 
    GoogleDriveModule, 
    FilesModule
  ],
  providers: [UsersResolver, UsersService, ProfileResolver, ProfileService],
  exports: [UsersService, ProfileService],
})
export class UsersModule {}
```

### 3. Cập nhật Auth Module

Đảm bảo `ProfileService` được inject vào `AuthService` để ghi log hoạt động đăng nhập.

## Sử dụng API

### Queries

#### Lấy thông tin profile hiện tại
```graphql
query GetMyProfile {
  myProfile {
    id
    email
    firstName
    lastName
    fullName
    avatar
    phoneNumber
    address
    # ... các trường khác
  }
}
```

#### Lấy lịch sử hoạt động
```graphql
query GetUserActivities($input: GetUserActivitiesInput!) {
  getUserActivities(input: $input) {
    data {
      id
      activityType
      description
      createdAt
    }
    meta {
      page
      limit
      itemCount
    }
  }
}
```

### Mutations

#### Cập nhật profile
```graphql
mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    metadata {
      statusCode
      message
    }
    data {
      id
      firstName
      lastName
      # ... các trường đã cập nhật
    }
  }
}
```

#### Upload avatar
```graphql
mutation UploadAvatar($avatarFile: Upload!) {
  uploadAvatar(avatarFile: $avatarFile) {
    metadata {
      statusCode
      message
    }
    data {
      id
      avatar
    }
  }
}
```

## Các loại hoạt động được theo dõi

Hệ thống tự động ghi log các hoạt động sau:

- `LOGIN`: Đăng nhập
- `LOGOUT`: Đăng xuất
- `PROFILE_UPDATE`: Cập nhật profile
- `PASSWORD_CHANGE`: Đổi mật khẩu
- `AVATAR_UPDATE`: Cập nhật avatar
- `DOCUMENT_VIEW`: Xem tài liệu
- `DOCUMENT_CREATE`: Tạo tài liệu
- `DOCUMENT_UPDATE`: Cập nhật tài liệu
- `DOCUMENT_DELETE`: Xóa tài liệu
- `TASK_ASSIGNED`: Được giao nhiệm vụ
- `TASK_COMPLETED`: Hoàn thành nhiệm vụ
- `APPROVAL_REQUESTED`: Yêu cầu phê duyệt
- `APPROVAL_APPROVED`: Phê duyệt
- `APPROVAL_REJECTED`: Từ chối phê duyệt

## Tích hợp với các module khác

### Authentication
```typescript
// Trong AuthService
constructor(
  private readonly profileService: ProfileService,
  // ... other services
) {}

// Tự động ghi log đăng nhập
await this.profileService.updateLastLogin(user.id, req);
```

### Document Management
```typescript
// Trong DocumentService
constructor(
  private readonly profileService: ProfileService,
  // ... other services
) {}

// Ghi log khi user xem tài liệu
await this.profileService.logActivity(
  userId,
  ActivityType.DOCUMENT_VIEW,
  `Xem tài liệu: ${document.title}`
);
```

## Validation

### UpdateProfileInput
- Email phải có định dạng hợp lệ
- Website phải có URL hợp lệ
- Các trường string có độ dài phù hợp

### File Upload
- Chỉ chấp nhận file ảnh (jpg, png, gif)
- Kích thước file tối đa: 5MB
- Tự động resize ảnh avatar

## Bảo mật

### Privacy Settings
- `isProfilePublic`: Kiểm soát hiển thị thông tin công khai
- Thông tin nhạy cảm không được expose qua GraphQL
- IP address và User Agent được ghi log

### Audit Trail
- Tất cả thay đổi được ghi log với timestamp
- Metadata chứa thông tin chi tiết
- Có thể truy vết lịch sử thay đổi

## Testing

### Unit Tests
```bash
npm run test users
```

### Integration Tests
```bash
npm run test:e2e
```

### GraphQL Playground
Sử dụng GraphQL Playground để test các queries và mutations:
- URL: `http://localhost:3000/graphql`
- Sử dụng file `profile-queries.graphql` để test

## Troubleshooting

### Lỗi thường gặp

1. **Migration failed**
   - Kiểm tra quyền database
   - Đảm bảo database connection

2. **File upload failed**
   - Kiểm tra Google Drive credentials
   - Kiểm tra file size và format

3. **Activity logging failed**
   - Kiểm tra database connection
   - Kiểm tra UserActivity table

### Debug

```typescript
// Enable debug logging
import { Logger } from '@nestjs/common';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  
  async updateProfile(userId: number, input: UpdateProfileInput) {
    this.logger.debug(`Updating profile for user ${userId}`);
    // ... implementation
  }
}
```

## Performance

### Indexes
Database đã được tối ưu với các indexes:
- `idx_user_activities_user_id`
- `idx_user_activities_created_at`
- `idx_user_activities_type`

### Caching
Có thể thêm Redis cache cho:
- User profile data
- Activity statistics
- Recent activities

## Roadmap

- [ ] Push notifications
- [ ] Profile analytics dashboard
- [ ] Social media integration
- [ ] Profile templates
- [ ] Advanced privacy controls
- [ ] Activity export functionality
- [ ] Real-time activity feed
- [ ] Profile completion percentage
