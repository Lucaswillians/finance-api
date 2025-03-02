import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsEntity } from './transactions.entity';
import { AccountsModule } from 'src/accounts/account.module';
import { TransactionService } from './transactions.service';
import { TransactionController } from './transactions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionsEntity]),
    AccountsModule,
  ],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports: [TransactionService], // Certifique-se de exportar o TransactionService
})
export class TransactionModule { }
