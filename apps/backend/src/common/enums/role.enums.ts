export enum Role {
  // Vai trò Văn thư: Xử lý công văn, giấy tờ, lưu trữ, đóng dấu.
  CLERK = 'CLERK',

  // Vai trò Chánh Văn phòng: Quản lý chung văn phòng, tham mưu, điều phối.
  OFFICE_MANAGER = 'OFFICE_MANAGER',

  // Vai trò Lãnh đạo Trường: Phê duyệt, ký ban hành các văn bản quan trọng, quyết định chính sách.
  // Bao gồm Hiệu trưởng, Phó Hiệu trưởng.
  UNIVERSITY_LEADER = 'UNIVERSITY_LEADER',

  // Vai trò Trưởng Đơn vị: Quản lý các phòng/ban/khoa, ký nháy, phân công công việc.
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',

  // Vai trò Chuyên viên Đơn vị: Thực hiện các nghiệp vụ chuyên môn tại phòng/ban/khoa.
  // Ví dụ: Soạn thảo văn bản, rà soát thông tin.
  DEPARTMENT_STAFF = 'DEPARTMENT_STAFF',

  // Vai trò Quản lý Văn bằng Chứng chỉ: Xử lý các quy trình liên quan đến phôi bằng,
  // in ấn, cấp phát, lưu trữ, chỉnh sửa, xác minh văn bằng và chứng chỉ.
  DEGREE_CERTIFICATE_MANAGER = 'DEGREE_CERTIFICATE_MANAGER',

  // Vai trò cho các nhiệm vụ/văn bản chưa được phân công cụ thể cho một vai trò xử lý.
  // Hoặc dùng cho người dùng/tài khoản mới tạo, đang chờ gán vai trò chính thức.
  UNASSIGNED_TASK_HANDLER = 'UNASSIGNED_TASK_HANDLER', // Hoặc PENDING_ASSIGNMENT, GENERAL_QUEUE

  // (Tùy chọn) Vai trò Quản trị viên Hệ thống Tối cao: Quản lý người dùng, phân quyền, cấu hình hệ thống.
  SUPER_ADMIN = 'SUPER_ADMIN',
}
