import { Module } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [ProducerService, ConfigService],
  imports: [ConfigModule.forRoot({ cache: true })],
  exports: [ProducerService],
})
export class ProducerModule {}
