import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';
import { CreateAdminRootDto } from '../admin/dto/create-root-admin.dto';
import inquirer from 'inquirer';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const adminService = app.get(AdminService);

  try {
    console.log('==== CREATE ADMIN ====');

    const answers = await inquirer.prompt([
      {
        name: 'username',
        message: 'Username:',
        type: 'input',
        validate: (input) => (input ? true : 'Username không được để trống!'),
      },
      {
        name: 'email',
        message: 'Email:',
        type: 'input',
        validate: (input) =>
          /\S+@\S+\.\S+/.test(input) ? true : 'Vui lòng nhập email hợp lệ!',
      },
      {
        name: 'password',
        message: 'Password:',
        type: 'password',
        mask: '*',
        validate: (input) =>
          input.length >= 6 ? true : 'Mật khẩu phải có ít nhất 6 ký tự!',
      },
      {
        name: 'confirm',
        message: 'Bạn có chắc chắn muốn tạo tài khoản này?',
        type: 'confirm',
        default: true,
      },
    ]);

    if (!answers.confirm) {
      console.log("Hủy tạo tài khoản");
      process.exit(0);
    }

    const createRootAdminDto: CreateAdminRootDto = {
      username: answers.username,
      email: answers.email,
      password: answers.password,
    };

    await adminService.createRoot(createRootAdminDto);
    console.log('Tạo Admin thành công, chào mừng Admin tới hệ thống :)))');
    process.exit(0);
  } catch (err) {
    console.log(`Lỗi khi tạo Admin: ${err}`);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
