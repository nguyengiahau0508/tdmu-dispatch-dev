# Mô tả chi tiết - Sơ đồ tuần tự Thông báo và Báo cáo (Notification & Report)

## Tổng quan

Sơ đồ tuần tự thông báo và báo cáo mô tả toàn bộ hệ thống thông báo real-time, quản lý thông báo, tạo báo cáo tùy chỉnh, xuất báo cáo và lập lịch báo cáo trong hệ thống TDMU Dispatch.

## Các thành phần tham gia

### Actors
- **User**: Người dùng cuối nhận và quản lý thông báo, xem báo cáo

### Participants
- **Frontend**: Giao diện người dùng (Angular)
- **NotificationService**: Service xử lý logic thông báo
- **ReportService**: Service xử lý logic báo cáo
- **WebSocketService**: Service quản lý kết nối WebSocket
- **MailService**: Service gửi email
- **Database**: Cơ sở dữ liệu MySQL
- **Cache**: Redis cache cho thông báo và báo cáo

## Chi tiết các use case

### 1. Nhận thông báo real-time

#### Mô tả
User nhận thông báo real-time thông qua WebSocket connection khi có sự kiện mới trong hệ thống.

#### Luồng xử lý
1. **User → Frontend**: Mở ứng dụng
2. **Frontend → NotificationService**: Gọi API `subscribeToNotifications(userId)`
3. **NotificationService → WebSocketService**: `createConnection(userId)`
4. **WebSocketService → NotificationService**: Trả về WebSocket connection
5. **NotificationService → Frontend**: Trả về Connection established

#### Xử lý thông báo real-time
- **Loop Real-time notifications**:
  - NotificationService → WebSocketService: `sendNotification(notification)`
  - WebSocketService → Frontend: WebSocket message
  - Frontend → Frontend: Update notification badge
  - Frontend → Frontend: Show notification toast
  - Frontend → User: Hiển thị thông báo mới

### 2. Xem danh sách thông báo

#### Mô tả
User xem danh sách tất cả thông báo đã nhận với phân trang.

#### Luồng xử lý
1. **User → Frontend**: Truy cập trang notifications
2. **Frontend → NotificationService**: Gọi API `getNotifications(userId, pagination)`
3. **NotificationService → Database**: SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?
4. **Database → NotificationService**: Trả về notifications list
5. **NotificationService → Frontend**: Trả về Notification array
6. **Frontend → User**: Hiển thị danh sách thông báo

### 3. Đánh dấu đã đọc

#### Mô tả
User đánh dấu thông báo đã đọc và cập nhật trạng thái.

#### Luồng xử lý
1. **User → Frontend**: Click vào thông báo
2. **Frontend → NotificationService**: Gọi API `markAsRead(notificationId)`
3. **NotificationService → Database**: UPDATE notifications SET isRead = true WHERE id = ?
4. **Database → NotificationService**: Success
5. **NotificationService → Cache**: `updateNotificationCount(userId)`
6. **Cache → NotificationService**: Success
7. **NotificationService → Frontend**: Trả về Success response
8. **Frontend → Frontend**: Update notification badge
9. **Frontend → User**: Cập nhật trạng thái đã đọc

### 4. Cấu hình thông báo

#### Mô tả
User cấu hình cài đặt thông báo theo ý muốn.

#### Luồng xử lý
1. **User → Frontend**: Truy cập cài đặt thông báo
2. **Frontend → NotificationService**: Gọi API `getNotificationSettings(userId)`
3. **NotificationService → Database**: SELECT * FROM user_notification_settings WHERE userId = ?
4. **Database → NotificationService**: Trả về settings data
5. **NotificationService → Frontend**: Trả về NotificationSettings object
6. **Frontend → User**: Hiển thị form cài đặt

7. **User → Frontend**: Thay đổi cài đặt
8. **Frontend → NotificationService**: Gọi API `updateNotificationSettings(userId, settings)`
9. **NotificationService → Database**: UPDATE user_notification_settings SET emailNotifications = ?, pushNotifications = ? WHERE userId = ?
10. **Database → NotificationService**: Success
11. **NotificationService → Frontend**: Trả về Success response
12. **Frontend → User**: Hiển thị thông báo cập nhật thành công

### 5. Gửi thông báo workflow

#### Mô tả
Hệ thống tự động gửi thông báo khi có sự kiện workflow mới.

#### Luồng xử lý
1. **NotificationService → NotificationService**: `sendWorkflowNotification(workflowId, action, targetRole)`
2. **NotificationService → Database**: SELECT * FROM users WHERE roles LIKE ?
3. **Database → NotificationService**: Trả về target users list

#### Xử lý cho từng target user
- **Loop cho mỗi target user**:
  - NotificationService → Database: INSERT INTO notifications (userId, type, title, message, metadata)
  - Database → NotificationService: Trả về notificationId

  - **Nếu email notifications enabled**:
    - NotificationService → MailService: `sendWorkflowEmail(user.email, notification)`
    - MailService → NotificationService: Success

  - **Nếu push notifications enabled**:
    - NotificationService → WebSocketService: `sendPushNotification(userId, notification)`
    - WebSocketService → NotificationService: Success

### 6. Xem báo cáo tổng quan

#### Mô tả
User xem dashboard tổng quan với các thống kê chính của hệ thống.

#### Luồng xử lý
1. **User → Frontend**: Truy cập trang dashboard
2. **Frontend → ReportService**: Gọi API `getDashboardReport(userId)`
3. **ReportService → Database**: SELECT COUNT(*) FROM documents WHERE status = 'PENDING'
4. **Database → ReportService**: Trả về pending documents count
5. **ReportService → Database**: SELECT COUNT(*) FROM workflow_instances WHERE status = 'IN_PROGRESS'
6. **Database → ReportService**: Trả về active workflows count
7. **ReportService → Database**: SELECT COUNT(*) FROM documents WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
8. **Database → ReportService**: Trả về documents this month count
9. **ReportService → Database**: SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) FROM workflow_instances WHERE status = 'COMPLETED'
10. **Database → ReportService**: Trả về average processing time
11. **ReportService → Frontend**: Trả về DashboardReport object
12. **Frontend → User**: Hiển thị dashboard tổng quan

### 7. Tạo báo cáo tùy chỉnh

#### Mô tả
User tạo báo cáo tùy chỉnh theo loại và tham số mong muốn.

#### Luồng xử lý
1. **User → Frontend**: Chọn loại báo cáo và tham số
2. **Frontend → ReportService**: Gọi API `generateCustomReport(reportInput)`
3. **ReportService**: Validate report parameters

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- ReportService throw `BadRequestException`
- Frontend hiển thị lỗi validation

**Trường hợp 2: Validation passed**
- **Xử lý theo loại báo cáo**:

  **Report type = "Document Statistics"**:
  - ReportService → Database: SELECT documentType, COUNT(*) FROM documents WHERE createdAt BETWEEN ? AND ? GROUP BY documentType
  - Database → ReportService: Trả về document stats
  - ReportService → Database: SELECT status, COUNT(*) FROM documents WHERE createdAt BETWEEN ? AND ? GROUP BY status
  - Database → ReportService: Trả về status stats

  **Report type = "Workflow Performance"**:
  - ReportService → Database: SELECT templateId, AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) FROM workflow_instances WHERE status = 'COMPLETED' AND createdAt BETWEEN ? AND ? GROUP BY templateId
  - Database → ReportService: Trả về workflow performance
  - ReportService → Database: SELECT action, COUNT(*) FROM workflow_action_logs WHERE createdAt BETWEEN ? AND ? GROUP BY action
  - Database → ReportService: Trả về action stats

  **Report type = "User Activity"**:
  - ReportService → Database: SELECT userId, COUNT(*) FROM user_activities WHERE createdAt BETWEEN ? AND ? GROUP BY userId
  - Database → ReportService: Trả về user activity
  - ReportService → Database: SELECT activityType, COUNT(*) FROM user_activities WHERE createdAt BETWEEN ? AND ? GROUP BY activityType
  - Database → ReportService: Trả về activity type stats

- **Tạo báo cáo**:
  - ReportService → ReportService: `generateReport(data, reportInput.format)`
  - ReportService → Frontend: Trả về CustomReport object
  - Frontend → User: Hiển thị báo cáo tùy chỉnh

### 8. Xuất báo cáo

#### Mô tả
User xuất báo cáo ra các định dạng khác nhau (PDF, Excel, CSV).

#### Luồng xử lý
1. **User → Frontend**: Click nút "Xuất báo cáo"
2. **Frontend → ReportService**: Gọi API `exportReport(reportId, format)`
3. **ReportService → ReportService**: `getReportData(reportId)`

#### Xử lý theo định dạng

**Format = "PDF"**:
- ReportService → ReportService: `generatePDF(reportData)`
- ReportService → Frontend: Trả về PDF blob
- Frontend → Frontend: Create download link
- Frontend → User: Tự động download PDF

**Format = "Excel"**:
- ReportService → ReportService: `generateExcel(reportData)`
- ReportService → Frontend: Trả về Excel blob
- Frontend → Frontend: Create download link
- Frontend → User: Tự động download Excel

**Format = "CSV"**:
- ReportService → ReportService: `generateCSV(reportData)`
- ReportService → Frontend: Trả về CSV blob
- Frontend → Frontend: Create download link
- Frontend → User: Tự động download CSV

### 9. Xem thống kê workflow

#### Mô tả
User xem thống kê chi tiết về workflow theo khoảng thời gian.

#### Luồng xử lý
1. **User → Frontend**: Truy cập trang thống kê workflow
2. **Frontend → ReportService**: Gọi API `getWorkflowStatistics(timeRange)`
3. **ReportService → Database**: SELECT status, COUNT(*) FROM workflow_instances WHERE createdAt BETWEEN ? AND ? GROUP BY status
4. **Database → ReportService**: Trả về workflow status stats
5. **ReportService → Database**: SELECT templateId, COUNT(*) FROM workflow_instances WHERE createdAt BETWEEN ? AND ? GROUP BY templateId
6. **Database → ReportService**: Trả về template usage stats
7. **ReportService → Database**: SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) FROM workflow_instances WHERE status = 'COMPLETED' AND createdAt BETWEEN ? AND ?
8. **Database → ReportService**: Trả về average completion time
9. **ReportService → Database**: SELECT MAX(TIMESTAMPDIFF(HOUR, created_at, updated_at)) FROM workflow_instances WHERE status = 'COMPLETED' AND createdAt BETWEEN ? AND ?
10. **Database → ReportService**: Trả về max completion time
11. **ReportService → Frontend**: Trả về WorkflowStatistics object
12. **Frontend → User**: Hiển thị thống kê workflow

### 10. Lập lịch báo cáo

#### Mô tả
User lập lịch gửi báo cáo định kỳ theo email.

#### Luồng xử lý
1. **User → Frontend**: Tạo báo cáo định kỳ
2. **Frontend → ReportService**: Gọi API `scheduleReport(scheduleInput)`
3. **ReportService**: Validate schedule parameters

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- ReportService throw `BadRequestException`
- Frontend hiển thị lỗi validation

**Trường hợp 2: Validation passed**
- **Tạo schedule**:
  - ReportService → Database: INSERT INTO report_schedules (userId, reportType, frequency, recipients, parameters)
  - Database → ReportService: Trả về scheduleId
  - ReportService → Frontend: Trả về ReportSchedule object
  - Frontend → User: Hiển thị thông báo lập lịch thành công

### 11. Gửi báo cáo định kỳ

#### Mô tả
Hệ thống tự động gửi báo cáo định kỳ theo lịch đã thiết lập.

#### Luồng xử lý
1. **ReportService → ReportService**: `checkScheduledReports()`
2. **ReportService → Database**: SELECT * FROM report_schedules WHERE nextRun <= NOW()
3. **Database → ReportService**: Trả về due schedules list

#### Xử lý cho từng schedule
- **Loop cho mỗi schedule**:
  - ReportService → ReportService: `generateReport(schedule.reportType, schedule.parameters)`
  - ReportService → ReportService: `generatePDF(reportData)`
  - ReportService → MailService: `sendScheduledReport(schedule.recipients, reportPDF, schedule.reportType)`
  - MailService → ReportService: Success
  - ReportService → Database: UPDATE report_schedules SET lastRun = NOW(), nextRun = calculateNextRun(schedule.frequency) WHERE id = ?
  - Database → ReportService: Success

## Các đặc điểm kỹ thuật

### Notification System
- **Real-time Notifications**: Sử dụng WebSocket cho thông báo real-time
- **Multi-channel Delivery**: Email, push notifications, in-app notifications
- **Notification Preferences**: User có thể cấu hình loại thông báo muốn nhận
- **Notification History**: Lưu trữ lịch sử thông báo

### Report System
- **Custom Reports**: Tạo báo cáo tùy chỉnh theo yêu cầu
- **Multiple Formats**: Xuất báo cáo ra PDF, Excel, CSV
- **Scheduled Reports**: Lập lịch gửi báo cáo định kỳ
- **Real-time Data**: Báo cáo với dữ liệu real-time

### Database Design
- **Notifications Table**: Lưu thông báo
- **User Notification Settings**: Lưu cài đặt thông báo của user
- **Report Schedules**: Lưu lịch báo cáo
- **User Activities**: Lưu hoạt động của user

### Security
- **User-specific Notifications**: Chỉ user có quyền mới nhận được thông báo
- **Report Access Control**: Kiểm tra quyền truy cập báo cáo
- **Data Privacy**: Bảo vệ dữ liệu cá nhân trong báo cáo

### Performance
- **WebSocket Connection**: Kết nối real-time hiệu quả
- **Caching**: Cache thông báo và báo cáo
- **Pagination**: Phân trang cho danh sách thông báo
- **Background Processing**: Xử lý báo cáo trong background

## Các trường hợp đặc biệt

### Notification Types
- **Workflow Notifications**: Thông báo về workflow events
- **Document Notifications**: Thông báo về document changes
- **System Notifications**: Thông báo hệ thống
- **User Notifications**: Thông báo cá nhân

### Report Types
- **Document Statistics**: Thống kê văn bản
- **Workflow Performance**: Hiệu suất workflow
- **User Activity**: Hoạt động người dùng
- **System Metrics**: Metrics hệ thống

### Notification Channels
- **In-app**: Thông báo trong ứng dụng
- **Email**: Thông báo qua email
- **Push**: Push notifications
- **SMS**: Thông báo SMS (nếu có)

## Monitoring và Logging

### Audit Trail
- Log tất cả các thông báo được gửi
- Track user interaction với thông báo
- Monitor report generation và delivery

### Metrics
- Số lượng thông báo được gửi/nhận
- Thời gian phản hồi thông báo
- Số lượng báo cáo được tạo/xuất

## Tích hợp với hệ thống

### Workflow Integration
- Thông báo tự động khi có workflow events
- Báo cáo workflow performance
- Track workflow metrics

### Document Integration
- Thông báo khi có document changes
- Báo cáo document statistics
- Monitor document lifecycle

### User Management Integration
- Thông báo user-specific
- Báo cáo user activity
- Personalization dựa trên user preferences

