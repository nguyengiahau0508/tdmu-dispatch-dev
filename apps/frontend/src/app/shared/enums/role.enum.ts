export enum Role {
  // Vai trò Quản lý Văn bằng Chứng chỉ: Xử lý các quy trình liên quan đến phôi bằng,
  // in ấn, cấp phát, lưu trữ, chỉnh sửa, xác minh văn bằng và chứng chỉ.
  DEGREE_CERTIFICATE_MANAGER = 'DEGREE_CERTIFICATE_MANAGER',

  // Vai trò cho các nhiệm vụ/văn bản chưa được phân công cụ thể cho một vai trò xử lý.
  // Hoặc dùng cho người dùng/tài khoản mới tạo, đang chờ gán vai trò chính thức.
  UNASSIGNED_TASK_HANDLER = 'UNASSIGNED_TASK_HANDLER', // Hoặc PENDING_ASSIGNMENT, GENERAL_QUEUE

  // (Tùy chọn) Vai trò Quản trị viên Hệ thống Tối cao: Quản lý người dùng, phân quyền, cấu hình hệ thống.
  SUPER_ADMIN = 'SUPER_ADMIN',

  /**
   * @description Quyền của Quản trị viên hệ thống.
   * Có toàn quyền trên hệ thống: quản lý người dùng, phân quyền, cấu hình.
   */
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',

  /**
   * @description Quyền của Lãnh đạo cấp cao (Hiệu trưởng, Phó Hiệu trưởng).
   * Phê duyệt các văn bản quan trọng nhất, xem báo cáo toàn trường, ra quyết định chiến lược.
   */
  UNIVERSITY_LEADER = 'UNIVERSITY_LEADER',

  /**
   * @description Quyền của người đứng đầu một Đơn vị (Khoa, Phòng, Ban, Trung tâm).
   * Quản lý nhân sự, phê duyệt văn bản trong phạm vi đơn vị, xem báo cáo của đơn vị.
   * Người có Position "Trưởng khoa" sẽ được gán Role này.
   */
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',

  /**
   * @description Quyền của Chuyên viên/Nhân viên trong một đơn vị.
   * Soạn thảo văn bản, thực hiện các nghiệp vụ chuyên môn, xem các tài liệu được chia sẻ trong đơn vị.
   */
  DEPARTMENT_STAFF = 'DEPARTMENT_STAFF',

  /**
   * @description Quyền của Văn thư.
   * Xử lý luồng văn bản: nhận văn bản đến, phát hành văn bản đi, đóng dấu, lưu trữ, quản lý sổ công văn.
   */
  CLERK = 'CLERK',

  /**
   * @description Quyền quản lý liên quan đến Văn bằng, Chứng chỉ.
   * Truy cập module quản lý phôi bằng, in, cấp phát, và xác minh văn bằng.
   * Đây là một vai trò chuyên biệt, có thể gán cho một chuyên viên ở phòng Đào tạo hoặc phòng Công tác Sinh viên.
   */
  DEGREE_MANAGER = 'DEGREE_MANAGER', // Rút gọn tên cho dễ dùng

  /**
   * @description Vai trò cơ bản nhất, gán cho tất cả người dùng khi đăng nhập.
   * Chỉ có các quyền cơ bản như xem thông tin cá nhân, xem các thông báo chung.
   * Hữu ích để đảm bảo mọi người dùng đã xác thực đều có ít nhất một vai trò.
   */
  BASIC_USER = 'BASIC_USER',
}
