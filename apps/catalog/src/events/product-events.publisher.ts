import { OnModuleInit, Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ProductCreatedEvent } from '../products/product.events';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductEventsPublisher implements OnModuleInit {
  private readonly logger = new Logger(ProductEventsPublisher.name);

  constructor(
    @Inject('SEARCH_EVENT_SERVICE')
    private readonly searchEventsClient: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.searchEventsClient.connect();
    this.logger.log('Connected to SEARCH_EVENT_SERVICE');
  }

  async productCreated(event: ProductCreatedEvent) {
    try {
      console.log('Publishing product created event', event);

      await firstValueFrom(
        this.searchEventsClient.emit('product.created', event),
      );
    } catch (err) {
      this.logger.warn('Error publishing product created event', err);
    }
  }
}
