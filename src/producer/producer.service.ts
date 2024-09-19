import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProducerService {
  private client: ClientProxy;
  constructor(private configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get('PRODUCER_HOST', 'localhost'),
        port: this.configService.get('PRODUCER_PORT', 5672),
        queue: this.configService.get('TARGET_QUEUE'),
      },
    });
  }

  async retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt < retries - 1) {
          await this.delay(delay);
        } else {
          throw error; // Rethrow the error after max retries
        }
      }
    }
  }

  async publish<T>(
    queue: string,
    message: T,
    retry: boolean = false,
    maxAttempt: number = 3,
    delay: number = 1000,
  ) {
    const publishFn = async () => {
      return await firstValueFrom(this.client.emit(queue, message));
    };

    if (retry) {
      return this.retry(publishFn, maxAttempt, delay);
    } else {
      return publishFn();
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
