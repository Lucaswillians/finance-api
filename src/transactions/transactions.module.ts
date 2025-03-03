import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsEntity } from './transactions.entity';
import { AccountsModule } from 'src/accounts/account.module';
import { TransactionService } from './transactions.service';
import { TransactionController } from './transactions.controller';
import { CurrencyModule } from 'src/currency/currency.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionsEntity]),  
    AccountsModule,  
    CurrencyModule,  
  ],
  providers: [TransactionService],  
  controllers: [TransactionController],  
  exports: [TransactionService],  
})
export class TransactionModule {}
