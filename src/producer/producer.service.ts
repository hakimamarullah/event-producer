import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProducerService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private logger: Logger = new Logger(ProducerService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.logger.log('Connecting to RabbitMQ...');
    this.connection = await amqp.connect({
      protocol: 'amqp',
      hostname: this.configService.get<string>('RABBITMQ_HOST'),
      port: this.configService.get<number>('RABBITMQ_PORT'),
      username: this.configService.get<string>('RABBITMQ_USER'),
      password: this.configService.get<string>('RABBITMQ_PASSWORD'),
      vhost: this.configService.get<string>('RABBITMQ_VHOST'),
    });
    this.channel = await this.connection.createChannel();
    this.logger.log('Connected to RabbitMQ');
  }

  /**
   * Send a message to a RabbitMQ queue.
   * @param queue - name of the queue to send the message to
   * @param message - the message to send (will be converted to a Buffer)
   * @returns a promise that resolves to the result of the send operation
   */
  async sendToQueue(queue: string, message: any) {
    return this.channel.sendToQueue(queue, Buffer.from(message));
  }

  /**
   * Publish a message to a RabbitMQ exchange.
   * @param exchange - name of the exchange to publish to
   * @param routingKey - routing key for the message
   * @param message - the message to publish (will be converted to a Buffer)
   * @returns a promise that resolves to the result of the publish operation
   */
  async publishToExchange(exchange: string, routingKey: string, message: any) {
    return this.channel.publish(exchange, routingKey, Buffer.from(message));
  }
}
