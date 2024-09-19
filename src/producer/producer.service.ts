import { Injectable, Logger } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProducerService {
  private client: ClientProxy;
  private logger: Logger = new Logger(ProducerService.name);
  constructor(private configService: ConfigService) {
    const urls = this.configService
      .get('RABBIT_URLS', 'amqp://localhost:5672')
      .split(',');
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: urls,
        maxRetriesPerRequest: this.configService.get('PRODUCER_MAX_RETRY', 3),
        maxReconnectAttempts: this.configService.get(
          'PRODUCER_MAX_RECONNECT',
          10,
        ),
      },
    } as RmqOptions);
  }

  public async publish<T>(queue: string, payload: T) {
    this.logger.log(`Publishing to queue: ${queue}`);
    const result = await firstValueFrom(this.client.emit(queue, payload));
    this.logger.log(
      `Done publishing to queue: ${queue} result: ${JSON.stringify(result)}`,
    );
    return result;
  }
}
