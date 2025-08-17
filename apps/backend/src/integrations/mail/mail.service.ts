import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

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

  async sendTaskAssignmentNotification(
    to: string,
    recipientName: string,
    taskTitle: string,
    assignedBy: string,
    deadline?: Date,
  ) {
    await this.mailerService.sendMail({
      to,
      subject: `Bạn có công việc mới: ${taskTitle}`,
      template: 'task-assignment-notification',
      context: {
        recipientName,
        taskTitle,
        assignedBy,
        deadline: deadline ? deadline.toLocaleDateString('vi-VN') : 'Không có hạn',
        currentDate: new Date().toLocaleDateString('vi-VN'),
      },
    });
  }
}
