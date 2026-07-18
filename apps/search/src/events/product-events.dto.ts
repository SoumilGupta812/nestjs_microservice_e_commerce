import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ProductCreatedDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsIn(['DRAFT', 'ACTIVE'])
  status: 'DRAFT' | 'ACTIVE';

  @IsNumber()
  @Min(1)
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  createdByClerkUserId: string;
}
