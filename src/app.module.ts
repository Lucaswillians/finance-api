import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PostgresConfigService } from './config/db.config.service';
import { AccountsModule } from './accounts/account.module';
import { TransactionModule } from './transactions/transactions.module';
import { ScheduledTransactionModule } from './scheduleTransactions/sheduleTransactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AccountsModule,
    TransactionModule,
    ScheduledTransactionModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: PostgresConfigService,
    }),

  ],
})
export class AppModule { }
