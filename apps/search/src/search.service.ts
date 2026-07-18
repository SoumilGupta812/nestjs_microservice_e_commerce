import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SearchDocument, SearchProduct } from './utils/search-index-schema';
import { Model } from 'mongoose';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(SearchProduct.name)
    private readonly searchProductModel: Model<SearchDocument>,
  ) {}

  normalizeText(input: { name: string; description: string }): string {
    return `${input.name} ${input.description}`.toLowerCase();
  }

  async upsertFromCatalogEvent(input: {
    productId: string;
    name: string;
    description: string;
    status: 'DRAFT' | 'ACTIVE';
    price: number;
  }) {
    const normalizedText = this.normalizeText({
      name: input.name,
      description: input.description,
    });
    return await this.searchProductModel.findOneAndUpdate(
      {
        ProductId: input.productId,
      },
      {
        $set: {
          ProductId: input.productId,
          Name: input.name,
          NormalizedText: normalizedText,
          Status: input.status,
          Price: input.price,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
  }

  async query(input: { q: string; limit?: number }) {
    const q = (input.q ?? '').trim().toLowerCase();

    if (!q) return [];

    const limit = Math.min(Math.max(input.limit ?? 10, 1), 100);
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    return await this.searchProductModel
      .find({ normalizedText: { $regex: regex } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  ping() {
    return {
      ok: true,
      service: 'search',
      now: new Date().toISOString(),
    };
  }
}
