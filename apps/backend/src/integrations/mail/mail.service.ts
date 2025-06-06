
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) { }

  async sendOtpMail(to: string, name: string, otp: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Mã OTP của bạn',
      template: 'otp-template', // tên file .hbs trong thư mục template (bỏ .hbs)
      context: {
        name,
        otp,
      },
    });
  }
}
