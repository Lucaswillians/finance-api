import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AccountsController } from './account.controller';
import { AccountsService } from './account.service';
import { AccountEntity } from './account.entity'; 
import { JwtStrategy } from '../auth/jwt.strategy';
import { AccountStatementEntity } from './accountStatement/accountStatement.entity';
import { AccountStatementService } from './accountStatement/accountStatement.service';
import { TransactionsEntity } from '../transactions/transactions.entity';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity, TransactionsEntity, AccountStatementEntity]), 
    JwtModule.register({
      secret: 'my_secret_key',
      signOptions: { expiresIn: '3600s' },
    }),
    CurrencyModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService, AccountStatementService, JwtStrategy],
  exports: [AccountsService, AccountStatementService], 
})
export class AccountsModule { }
