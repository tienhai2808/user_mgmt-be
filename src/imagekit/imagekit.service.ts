import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';
import sharp from 'sharp';

@Injectable()
export class ImageKitService {
  private imageKit: ImageKit;

  constructor(private readonly configService: ConfigService) {
    const publicKey = this.configService.get<string>('IMAGEKIT_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = this.configService.get<string>('IMAGEKIT_URL_ENDPOINT');

    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new HttpException(
        'Thiếu cấu hình ImageKit',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    this.imageKit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }

  async uploadImageFile(
    fileBuffer: Buffer,
    fileName: string,
    folder = 'user_mgmt',
  ): Promise<string> {
    try {
      const resizedBuffer = await sharp(fileBuffer)
        .resize({ width: 200, height: 200, fit: 'inside' })
        .toFormat('webp', { quality: 100 })
        .toBuffer();
  
      const result = await this.imageKit.upload({
        file: resizedBuffer.toString('base64'),
        fileName,
        folder,
      });
  
      return result.url;
    } catch (err) {
      console.error(`Lỗi khi upload file ảnh lên ImageKit:`, err);
      throw new HttpException(
        'Lỗi máy chủ khi xử lý ảnh',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: err },
      );
    }
  }
}
