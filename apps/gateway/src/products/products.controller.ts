import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from '../auth/current-user.decorator';
import type { UserContext } from '../auth/auth.types';
import { mapRpcErrorToHttp } from '@app/rpc/http/rpc-error.mapper';
import { firstValueFrom } from 'rxjs';
import { RequireAdmin } from '../auth/admin.decorator';
import { Public } from '../auth/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  status: 'DRAFT' | 'ACTIVE';
  imageUrl: string | undefined;
  createdByClerkUserId: string | undefined;
};
@Controller('')
export class ProductsHttpController {
  constructor(
    @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy,

    @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientProxy,
  ) {}

  @Post('products')
  @RequireAdmin()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
  )
  async createProduct(
    @CurrentUser() user: UserContext,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body()
    body: {
      name: string;
      description: string;
      price: number;
      status?: 'DRAFT' | 'ACTIVE';
      imageUrl?: string;
    },
  ) {
    let imageUrl: string | undefined = undefined;

    let mediaId: string | undefined = undefined;

    if (file) {
      const base64 = file.buffer.toString('base64');

      try {
        const uploadResult = await firstValueFrom<UploadProductImageResponse>(
          this.mediaClient.send('media.uploadProductImage', {
            fileName: file.originalname,
            mimeType: file.mimetype,
            base64,
            uploadByUserId: user.clerkUserId,
          }),
        );

        imageUrl = uploadResult.url;
        mediaId = uploadResult.mediaId;
        console.log('Uploaded product ', uploadResult);
      } catch (error) {
        mapRpcErrorToHttp(error);
      }
    }

    let product: Product;
    const payload = {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      status: body.status,
      imageUrl,
      createdByClerkUserId: user.clerkUserId,
    };

    try {
      product = await firstValueFrom(
        this.catalogClient.send('product.create', payload),
      );
    } catch (error) {
      mapRpcErrorToHttp(error);
    }
    console.log('Created product ', product);
    if (mediaId) {
      try {
        console.log('Attaching media to product');
        const result = await firstValueFrom(
          this.mediaClient.send('media.attachToProduct', {
            mediaId,
            productId: String(product._id),
            attachByUserId: user.clerkUserId,
          }),
        );
        console.log('Attached media to product', result);
      } catch (error) {
        mapRpcErrorToHttp(error);
      }
    }

    return product;
  }

  @Get('products')
  @Public()
  async listProducts() {
    try {
      return await firstValueFrom(this.catalogClient.send('product.list', {}));
    } catch (error) {
      mapRpcErrorToHttp(error);
    }
  }

  @Get('products/:id')
  @Public()
  async getProductById(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.catalogClient.send('product.getById', { id }),
      );
    } catch (error) {
      mapRpcErrorToHttp(error);
    }
  }
}

export interface UploadProductImageResponse {
  mediaId: string;
  url: string;
  publicId: string;
}
