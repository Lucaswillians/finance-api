import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsEntity } from './transactions.entity';
import { AccountsModule } from '../accounts/account.module';
import { TransactionService } from './transactions.service';
import { TransactionController } from './transactions.controller';
import { CurrencyModule } from '../currency/currency.module'; 
import { WinstonModule } from 'nest-winston';
import { appLogger } from 'src/Logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionsEntity]),  
    AccountsModule,  
    CurrencyModule,  
    WinstonModule.forRoot(appLogger),
  ],
  providers: [TransactionService],  
  controllers: [TransactionController],  
  exports: [TransactionService],  
})
export class TransactionModule {}
