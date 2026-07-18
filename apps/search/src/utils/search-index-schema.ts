import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SearchDocument = HydratedDocument<SearchProduct>;

@Schema({ timestamps: true })
export class SearchProduct {
  @Prop({ required: true, index: true, unique: true })
  ProductId: string;

  @Prop({ required: true })
  Name: string;

  @Prop({ required: true })
  NormalizedText: string;

  @Prop({ required: true, enum: ['DRAFT', 'ACTIVE'] })
  Status: 'DRAFT' | 'ACTIVE';

  @Prop({ required: true })
  Price: number;
}

export const SearchProductSchema = SchemaFactory.createForClass(SearchProduct);
