import { NestFactory } from '@nestjs/core';
import { ComprehensiveSeederModule } from './comprehensive-seeder.module';
import { ComprehensiveSeederService } from './comprehensive-seeder.service';

async function bootstrap() {
  console.log('🚀 Bắt đầu chạy Comprehensive Seeder...');
  
  try {
    // Tạo NestJS application context
    const app = await NestFactory.createApplicationContext(ComprehensiveSeederModule);
    
    // Lấy service
    const seederService = app.get(ComprehensiveSeederService);
    
    // Kiểm tra dữ liệu hiện có
    const hasExistingData = await seederService.checkExistingData();
    
    if (hasExistingData) {
      console.log('⚠️ Phát hiện dữ liệu hiện có trong database!');
      console.log('Bạn có muốn xóa tất cả dữ liệu và tạo lại không? (y/N)');
      
      // Trong môi trường production, có thể cần xác nhận từ user
      // Ở đây chúng ta sẽ tự động xóa và tạo lại
      console.log('🔄 Tự động xóa dữ liệu cũ và tạo lại...');
      await seederService.clearAllData();
    }
    
    // Chạy seeder
    await seederService.seed();
    
    console.log('✅ Comprehensive Seeder hoàn thành thành công!');
    console.log('\n📋 Thông tin đăng nhập:');
    console.log('Email: admin@tdmu.edu.vn');
    console.log('Password: password123');
    console.log('\n📋 Các tài khoản khác:');
    console.log('- hieutruong@tdmu.edu.vn / password123');
    console.log('- truongphong@tdmu.edu.vn / password123');
    console.log('- nhanvien1@tdmu.edu.vn / password123');
    console.log('- giangvien1@tdmu.edu.vn / password123');
    console.log('- thuky1@tdmu.edu.vn / password123');
    
    // Đóng application
    await app.close();
    
  } catch (error) {
    console.error('❌ Lỗi khi chạy Comprehensive Seeder:', error);
    process.exit(1);
  }
}

// Chạy seeder
bootstrap();
