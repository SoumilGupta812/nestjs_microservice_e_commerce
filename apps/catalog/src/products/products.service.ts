import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { isValidObjectId, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { rpcBadRequest, rpcNotFound } from '@app/rpc/rpc.helpers';
import type { ProductStatus } from './product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async createNewProduct(input: {
    name: string;
    description: string;
    price: number;
    status?: ProductStatus;
    imageUrl?: string;
    createdByClerkUserId: string;
  }) {
    if (!input.name || !input.description || !input.createdByClerkUserId) {
      rpcBadRequest('Missing required fields');
    }

    if (
      typeof input.price !== 'number' ||
      input.price < 0 ||
      Number.isNaN(input.price)
    ) {
      rpcBadRequest('Invalid price');
    }

    if (input.status && !['DRAFT', 'ACTIVE'].includes(input.status)) {
      rpcBadRequest('Invalid status');
    }
    const newlyCreatedProduct = await this.productModel.create({
      name: input.name,
      description: input.description,
      price: input.price,
      status: input.status ?? 'DRAFT',
      imageUrl: input.imageUrl ?? '',
      createdByClerkUserId: input.createdByClerkUserId,
    });

    return newlyCreatedProduct;
  }

  async listProducts() {
    return await this.productModel.find().sort({ createdAt: -1 }).exec();
  }

  async getProductById(id: string) {
    if (!isValidObjectId(id)) {
      rpcBadRequest('Invalid product ID');
    }

    const product = await this.productModel.findById(id).exec();

    if (!product) {
      rpcNotFound('Product not found');
    }

    return product;
  }
}
