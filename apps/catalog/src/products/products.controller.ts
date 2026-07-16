import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateProductDto, GetProductByIdDto } from './product.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('product.create')
  create(@Payload() payload: CreateProductDto) {
    return this.productsService.createNewProduct(payload);
  }

  @MessagePattern('product.list')
  list() {
    return this.productsService.listProducts();
  }

  @MessagePattern('product.getById')
  getProductById(@Payload() payload: GetProductByIdDto) {
    return this.productsService.getProductById(payload.id);
  }
}
// payload = actual data sent in the RPC message.
// @Payload() = NestJS microservice decorator used to extract incoming RPC message data.
// Imported from @nestjs/microservices.
// payload is only a variable name; it can be renamed to data, dto, etc.
// client.send(pattern, data) → data becomes the receiver's payload.
// @MessagePattern() identifies which message/route to handle.
// @Payload() extracts the data inside that message.
// @Body() is used for HTTP request bodies.
// @Payload() is used for microservice/RPC messages.
// Avoid payload: any in production; prefer a DTO such as payload: CreateProductDto.
// DTO + global ValidationPipe gives validation, whitelisting, transformation, and TypeScript safety.
