export enum Role {
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
