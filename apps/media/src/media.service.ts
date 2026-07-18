import { Injectable } from '@nestjs/common';
import { initCloudinary } from './cloudinary/cloudinary.client';
import { InjectModel } from '@nestjs/mongoose';
import { Media, MediaDocument } from './utils/media.schema';
import { Model } from 'mongoose';
import { rpcBadRequest } from '@app/rpc/rpc.helpers';
import type { UploadApiResponse } from 'cloudinary';
@Injectable()
export class MediaService {
  private readonly cloudinary = initCloudinary();

  constructor(
    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,
  ) {}
  ping() {
    return {
      ok: true,
      service: 'media',
      now: new Date().toISOString(),
    };
  }

  async uploadProductImage(input: {
    fileName: string;
    mimeType: string;
    base64: string;
    uploadByUserId: string;
  }) {
    if (!input.base64) rpcBadRequest('Base64 is required');
    if (!input.mimeType.startsWith('image/'))
      rpcBadRequest('Invalid MimeType. Only image files are allowed.');

    const buffer = Buffer.from(input.base64, 'base64');

    if (!buffer.length)
      rpcBadRequest('Invalid Base64 string. Unable to decode.');

    const uploadResult = await new Promise<UploadApiResponse | undefined>(
      (resolve, reject) => {
        this.cloudinary.uploader
          .upload_stream(
            {
              resource_type: 'image',
              folder: 'nestjs-microservices/product-images',
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(result);
            },
          )
          .end(buffer);
      },
    );

    const url = uploadResult?.secure_url || uploadResult?.url;

    const publicId = uploadResult?.public_id;

    if (!url || !publicId) {
      rpcBadRequest('Failed to upload image to Cloudinary.');
    }

    const media = await this.mediaModel.create({
      url,
      publicId,
      uploadByUserId: input.uploadByUserId,
      productId: undefined,
    });
    return { mediaId: String(media._id), url, publicId };
  }

  async attachToProduct(input: {
    mediaId: string;
    productId: string;
    attachByUserId?: string;
  }) {
    console.log('Attaching media to product', input);
    const media = await this.mediaModel
      .findByIdAndUpdate(
        input.mediaId,
        { $set: { productId: input.productId } },
        { returnDocument: 'after' },
      )
      .exec();
    if (!media) {
      rpcBadRequest('Media not found');
    }

    return {
      mediaId: String(media._id),
      productId: media.productId,
      url: media.url,
      publicId: media.publicId,
    };
  }
}
