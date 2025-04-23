import { HttpException, HttpStatus } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const multerOptions = {
  storage: memoryStorage(),
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return cb(new HttpException('Chỉ chấp nhận file ảnh', HttpStatus.BAD_REQUEST), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, 
  },
};
