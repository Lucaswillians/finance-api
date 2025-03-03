import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduledTransactionEntity } from './scheduleTransactions.entity';
import { ScheduledTransactionController } from './sheduleTransactions.controller';
import { ScheduledTransactionService } from './sheduleTransactions.service';
import { ScheduledTransactionProcessor } from './sheduleTransactions.processor';
import { AccountsModule } from '../accounts/account.module';
import { TransactionModule } from '../transactions/transactions.module';
import { QueueModule } from '../config/Queue.module';
import { CurrencyModule } from '../currency/currency.module';  
import { WinstonModule } from 'nest-winston';
import { appLogger } from 'src/Logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduledTransactionEntity]),
    QueueModule, 
    BullModule.registerQueue({ name: 'scheduled-transactions' }), 
    AccountsModule,
    TransactionModule,
    CurrencyModule,  
    WinstonModule.forRoot(appLogger),
  ],
  controllers: [ScheduledTransactionController],
  providers: [ScheduledTransactionService, ScheduledTransactionProcessor],
})
export class ScheduledTransactionModule { }
