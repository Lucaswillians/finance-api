import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, Repository } from 'typeorm';
import { AccountEntity } from '../../accounts/account.entity';
import { TransactionsEntity } from '../../transactions/transactions.entity';
import { TransactionType } from '../../transactions/enum/transactionts.enum';
import { AccountStatementEntity } from './accountStatement.entity';

@Injectable()
export class AccountStatementService {
  private readonly logger = new Logger(AccountStatementService.name);

  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
    @InjectRepository(TransactionsEntity)
    private transactionRepository: Repository<TransactionsEntity>,
    @InjectRepository(AccountStatementEntity)
    private statementRepository: Repository<AccountStatementEntity>,
  ) { }

  async generateStatement(accountId: string, startDate: Date, endDate: Date): Promise<AccountStatementEntity> {
    let account;
    try {
      account = await this.accountRepository.findOneOrFail({
        where: { id: accountId },
        relations: ['transactions'],
      });
      this.logger.log(`Account with ID ${accountId} found.`);
    } 
    catch (error) {
      this.logger.error(`Account with ID ${accountId} not found.`);
      throw new Error('Account not found');
    }

    const transactions = await this.transactionRepository.find({
      where: {
        account: { id: accountId },
        createdAt: Between(startDate, endDate),
      },
    });

    let totalDeposits = 0;
    let totalWithdrawals = 0;

    transactions.forEach(transaction => {
      if (transaction.type === TransactionType.DEPOSIT) {
        totalDeposits += parseFloat(transaction.amount.toString());
      } 
      else if (transaction.type === TransactionType.WITHDRAWAL) {
        totalWithdrawals += parseFloat(transaction.amount.toString());
      }
    });

    this.logger.log(`Total deposits: ${totalDeposits}, Total withdrawals: ${totalWithdrawals}`);

    const previousTransactions = await this.transactionRepository.find({
      where: {
        account: { id: accountId },
        createdAt: LessThan(startDate),
      },
    });

    let previousBalance = parseFloat(account.balance?.toString() || '0');
    previousTransactions.forEach(transaction => {
      if (transaction.type === TransactionType.DEPOSIT) {
        previousBalance += parseFloat(transaction.amount.toString());
      } 
      else if (transaction.type === TransactionType.WITHDRAWAL) {
        previousBalance -= parseFloat(transaction.amount.toString());
      }
    });

    const endBalance = previousBalance - totalWithdrawals;

    let previousBalanceFixed = 0;
    let endBalanceFixed = 0;

    try {
      previousBalanceFixed = parseFloat(previousBalance.toFixed(2));
      endBalanceFixed = parseFloat(endBalance.toFixed(2));
      this.logger.log(`Previous balance after rounding: ${previousBalanceFixed}, End balance after rounding: ${endBalanceFixed}`);
    } 
    catch (error) {
      this.logger.error('Error rounding balance');
      throw new Error('Error rounding balance');
    }

    if (isNaN(previousBalanceFixed) || isNaN(endBalanceFixed)) {
      this.logger.error('Invalid balance calculation after rounding');
      throw new Error('Invalid balance calculation after rounding');
    }

    const statement = this.statementRepository.create({
      account,
      start_balance: previousBalanceFixed,
      end_balance: endBalanceFixed,
      total_deposits: parseFloat(totalDeposits.toFixed(2)),
      total_withdrawals: parseFloat(totalWithdrawals.toFixed(2)),
      start_date: startDate,
      end_date: endDate,
    });

    try {
      const savedStatement = await this.statementRepository.save(statement);
      this.logger.log(`Account statement for account ID ${accountId} successfully generated.`);
      return savedStatement;
    } 
    catch (error) {
      this.logger.error('Failed to save account statement');
      throw new Error('Failed to save account statement');
    }
  }
}
