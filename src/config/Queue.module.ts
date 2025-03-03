import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('localhost'),
          port: configService.get<number>('6379'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [BullModule],
})
export class QueueModule { }
