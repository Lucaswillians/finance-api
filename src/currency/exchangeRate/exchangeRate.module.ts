import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CurrencyEntity } from '../currency.entity';
import { ExchangeRateService } from './exchangeRate.service';
import { ExchangeRateProcessor } from './ExchangeRateProcessor';
import { ExchangeRateController } from './ExchangeRate.controller';
import { QueueModule } from '../../config/Queue.module';
import { CurrencyModule } from '../../currency/currency.module';  

@Module({
  imports: [
    TypeOrmModule.forFeature([CurrencyEntity]),
    QueueModule,
    BullModule.registerQueue({ name: 'exchange-rate-queue' }),
    CurrencyModule,  
  ],
  providers: [ExchangeRateService, ExchangeRateProcessor],
  controllers: [ExchangeRateController],
})
export class ExchangeRateModule { }
