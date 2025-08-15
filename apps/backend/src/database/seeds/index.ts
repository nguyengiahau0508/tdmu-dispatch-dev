import { NestFactory } from '@nestjs/core';
import { SeederAppModule } from './seeder-app.module';
import { SeederSimpleService } from './seeder-simple.service';
import * as readline from 'readline';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederAppModule);
  const seederService = app.get(SeederSimpleService);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log('🌱 Bắt đầu quá trình seed dữ liệu...');

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
        console.log('🗑️  Xóa dữ liệu cũ...');
        await seederService.clearAllData();
        console.log('✅ Đã xóa dữ liệu cũ');
      } else {
        console.log('❌ Hủy quá trình seed dữ liệu');
        rl.close();
        await app.close();
        return;
      }
    }

    console.log('📦 Bắt đầu tạo dữ liệu mẫu...');
    await seederService.seed();
    console.log('✅ Hoàn thành seed dữ liệu!');
  } catch (error) {
    console.error('❌ Lỗi trong quá trình seed:', error);
  } finally {
    rl.close();
    await app.close();
  }
}

bootstrap();
