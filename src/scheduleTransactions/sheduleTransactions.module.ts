import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduledTransactionEntity } from './scheduleTransactions.entity';
import { ScheduledTransactionController } from './sheduleTransactions.controller';
import { ScheduledTransactionService } from './sheduleTransactions.service';
import { ScheduledTransactionProcessor } from './sheduleTransactions.processor';
import { AccountsModule } from 'src/accounts/account.module';
import { TransactionModule } from 'src/transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduledTransactionEntity]),
    BullModule.registerQueue({
      name: 'scheduled-transactions',
      redis: { host: 'localhost', port: 6379 },
    }),
    AccountsModule, 
    TransactionModule, 
  ],
  controllers: [ScheduledTransactionController],
  providers: [ScheduledTransactionService, ScheduledTransactionProcessor],
})
export class ScheduledTransactionModule { }
