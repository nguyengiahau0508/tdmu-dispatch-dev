/**
 * DEMO: Hệ thống Seed Dữ liệu Mẫu cho TDMU Dispatch
 *
 * Đây là file demo để hiển thị cách sử dụng hệ thống seed
 * Để chạy thực tế, bạn cần:
 * 1. Cấu hình database trong file .env
 * 2. Chạy lệnh: npm run seed
 */

import * as readline from 'readline';

// Simulate the seeder service
class DemoSeederService {
  async checkExistingData(): Promise<boolean> {
    console.log('🔍 Kiểm tra dữ liệu hiện có...');
    // Simulate checking existing data
    return Math.random() > 0.5; // Random result for demo
  }

  async clearAllData(): Promise<void> {
    console.log('🗑️  Xóa dữ liệu cũ...');
    console.log('   - Xóa WorkflowStep');
    console.log('   - Xóa WorkflowTemplate');
    console.log('   - Xóa DocumentType');
    console.log('   - Xóa DocumentCategory');
    console.log('   - Xóa Unit');
    console.log('   - Xóa UnitType');
    console.log('   - Xóa Position');
    console.log('   - Xóa Department');
    console.log('   - Xóa User');
  }

  async seed(): Promise<void> {
    console.log('🔧 Tạo dữ liệu mẫu...');

    // 1. Tạo Unit Types
    console.log('📋 Tạo Unit Types...');
    console.log('   - Trường Đại học');
    console.log('   - Khoa');
    console.log('   - Phòng Ban');
    console.log('   - Trung tâm');
    console.log('   - Viện');

    // 2. Tạo Units
    console.log('🏢 Tạo Units...');
    console.log('   - Trường Đại học Thủ Dầu Một');
    console.log('   - Khoa Công nghệ Thông tin');
    console.log('   - Khoa Kinh tế');
    console.log('   - Phòng Đào tạo');
    console.log('   - Phòng Tài chính - Kế toán');

    // 3. Tạo Departments
    console.log('🏛️ Tạo Departments...');
    console.log('   - Phòng Đào tạo');
    console.log('   - Phòng Tài chính - Kế toán');
    console.log('   - Phòng Tổ chức - Hành chính');
    console.log('   - Phòng Công tác Sinh viên');
    console.log('   - Phòng Khoa học Công nghệ');

    // 4. Tạo Positions
    console.log('👔 Tạo Positions...');
    console.log('   - Hiệu trưởng');
    console.log('   - Phó Hiệu trưởng');
    console.log('   - Trưởng phòng Đào tạo');
    console.log('   - Nhân viên Đào tạo');
    console.log('   - Trưởng phòng Tài chính');
    console.log('   - Kế toán trưởng');
    console.log('   - Nhân viên Kế toán');
    console.log('   - Trưởng phòng Tổ chức');
    console.log('   - Nhân viên Hành chính');

    // 5. Tạo Users
    console.log('👥 Tạo Users...');
    console.log('   - admin@tdmu.edu.vn (SYSTEM_ADMIN)');
    console.log('   - hieutruong@tdmu.edu.vn (UNIVERSITY_LEADER)');
    console.log('   - phohieutruong@tdmu.edu.vn (UNIVERSITY_LEADER)');
    console.log('   - daotao@tdmu.edu.vn (DEPARTMENT_STAFF)');
    console.log('   - taichinh@tdmu.edu.vn (DEPARTMENT_STAFF)');
    console.log('   - user1@tdmu.edu.vn (BASIC_USER)');
    console.log('   - user2@tdmu.edu.vn (BASIC_USER)');

    // 6. Tạo Document Categories
    console.log('📁 Tạo Document Categories...');
    console.log('   - Văn bản hành chính');
    console.log('   - Văn bản đào tạo');
    console.log('   - Văn bản tài chính');
    console.log('   - Văn bản nghiên cứu');
    console.log('   - Văn bản sinh viên');

    // 7. Tạo Document Types
    console.log('📄 Tạo Document Types...');
    console.log('   - Quyết định');
    console.log('   - Công văn');
    console.log('   - Thông báo');
    console.log('   - Báo cáo');
    console.log('   - Kế hoạch');
    console.log('   - Biên bản');
    console.log('   - Hợp đồng');
    console.log('   - Đơn từ');

    // 8. Tạo Workflow Templates
    console.log('🔄 Tạo Workflow Templates...');
    console.log('   - Quy trình phê duyệt văn bản thông thường');
    console.log('   - Quy trình phê duyệt văn bản tài chính');
    console.log('   - Quy trình phê duyệt văn bản đào tạo');

    // 9. Tạo Workflow Steps
    console.log('📋 Tạo Workflow Steps...');
    console.log('   - Tạo văn bản (START) - Role: BASIC_USER');
    console.log(
      '   - Phê duyệt trưởng phòng (APPROVAL) - Role: DEPARTMENT_STAFF',
    );
    console.log(
      '   - Phê duyệt phó hiệu trưởng (APPROVAL) - Role: UNIVERSITY_LEADER',
    );
    console.log('   - Phê duyệt hiệu trưởng (END) - Role: UNIVERSITY_LEADER');

    console.log('✅ Hoàn thành tạo dữ liệu mẫu!');
  }
}

async function demoBootstrap() {
  const seederService = new DemoSeederService();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log('🌱 Bắt đầu quá trình seed dữ liệu (DEMO)...');
    console.log('');

    // Kiểm tra xem đã có dữ liệu chưa
    const hasData = await seederService.checkExistingData();

    if (hasData) {
      const answer = await new Promise<string>((resolve) => {
        rl.question(
          '⚠️  Đã có dữ liệu trong database. Bạn có muốn xóa hết và tạo lại từ đầu? (y/N): ',
          (input) => {
            resolve(input.toLowerCase());
          },
        );
      });

      if (answer === 'y' || answer === 'yes') {
        console.log('');
        await seederService.clearAllData();
        console.log('✅ Đã xóa dữ liệu cũ');
        console.log('');
      } else {
        console.log('❌ Hủy quá trình seed dữ liệu');
        rl.close();
        return;
      }
    }

    console.log('');
    await seederService.seed();
    console.log('');
    console.log('🎉 DEMO hoàn thành!');
    console.log('');
    console.log('📝 Để chạy thực tế:');
    console.log('   1. Cấu hình database trong file .env');
    console.log('   2. Chạy lệnh: npm run seed');
    console.log('');
    console.log('🔑 Thông tin đăng nhập mẫu:');
    console.log('   - Email: admin@tdmu.edu.vn');
    console.log('   - Password: 123456');
    console.log('   - Role: SYSTEM_ADMIN');
  } catch (error) {
    console.error('❌ Lỗi trong quá trình seed:', error);
  } finally {
    rl.close();
  }
}

// Chạy demo
demoBootstrap();
