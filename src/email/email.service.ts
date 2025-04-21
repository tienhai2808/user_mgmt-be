import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { emailConfig } from '../config/email.config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport(emailConfig(this.configService));
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from : this.configService.get<string>('SMTP_FROM', 'no-reply@yourapp.com'),
      to,
      subject: 'Mã OTP đăng ký tài khoản tại Hệ thống quản lý người dùng',
      html: `<p>Mã OTP của bạn là <b>${otp}</b>. Nó sẽ hết hạn sau 3 phút, nếu bạn nhập sai sẽ bị hủy.</p>`
    })
  }
}
