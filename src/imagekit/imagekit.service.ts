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

  async uploadBase64Image(
    base64String: string,
    fileName: string,
    folder: string = 'user_mgmt',
  ): Promise<string> {
    try {
      const base64Data = base64String.replace(
        /^data:image\/[a-z]+;base64,/,
        '',
      );
      const buffer = Buffer.from(base64Data, 'base64');
      const resizedBuffer = await sharp(buffer)
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
      console.log(`Lỗi khi upload ảnh lên ImageKit: ${err}`);
      throw new HttpException(
        'Lỗi máy chủ nội bộ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: err },
      );
    }
  }
}
