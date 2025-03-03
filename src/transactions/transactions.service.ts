import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/CreateTransactions.dto';
import { TransactionsEntity } from './transactions.entity';
import { TransactionType } from './enum/transactionts.enum';
import { AccountsService } from 'src/accounts/account.service';
import { CurrencyService } from 'src/currency/currency.service';
import Decimal from 'decimal.js';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionsEntity)
    private readonly transactionsRepository: Repository<TransactionsEntity>,
    private accountService: AccountsService,
    private currencyService: CurrencyService,
  ) { }

  async createTransaction(dto: CreateTransactionDto): Promise<TransactionsEntity> {
    const queryRunner = this.transactionsRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const account = await this.accountService.getAccountById(dto.accountId);
      if (!account) {
        throw new NotFoundException('Destiny account not found!');
      }

      const accountBalance = new Decimal(account.balance);
      const transactionAmount = new Decimal(dto.amount);

      if (dto.type === TransactionType.WITHDRAWAL && accountBalance.lessThan(transactionAmount)) {
        throw new BadRequestException('Insufficient balance!');
      }

      let amountInBaseCurrency = transactionAmount;
      let currency;

      if (dto.currencyCode && dto.currencyCode !== 'USD') {
        currency = await this.currencyService.getCurrencyByCode(dto.currencyCode);

        if (!currency) {
          throw new BadRequestException('Currency not supported for conversion');
        }

        const exchangeRate = new Decimal(currency.exchangeRate);
        amountInBaseCurrency = transactionAmount.div(exchangeRate);
      } 
      else {
        currency = await this.currencyService.getCurrencyByCode('USD');
      }

      let destinationAccount;
      if (dto.destinationAccountId) {
        destinationAccount = await this.accountService.getAccountById(dto.destinationAccountId);
        if (!destinationAccount) {
          throw new NotFoundException('Destiny account not found!');
        }
      }

      if (dto.type === TransactionType.WITHDRAWAL) {
        account.balance = accountBalance.minus(transactionAmount).toNumber();
      }
      else if (dto.type === TransactionType.DEPOSIT) {
        account.balance = accountBalance.plus(transactionAmount).toNumber();
      }

      if (dto.type === TransactionType.TRANSFER && destinationAccount) {
        if (accountBalance.lessThan(transactionAmount)) {
          throw new BadRequestException('Insufficient balance!');
        }

        const destinationAccountBalance = new Decimal(destinationAccount.balance);
        destinationAccount.balance = destinationAccountBalance.plus(transactionAmount).toNumber();

        account.balance = accountBalance.minus(transactionAmount).toNumber();
      }

      const transaction = this.transactionsRepository.create({
        type: dto.type,
        amount: dto.amount,
        account: account,
        destinationAccount: destinationAccount,
        amountInBaseCurrency: amountInBaseCurrency.toNumber(),
        currency: currency,
        exchangeRate: currency.exchangeRate,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      await queryRunner.manager.update(
        account.constructor,
        account.id,
        { balance: account.balance }
      );

      if (destinationAccount) {
        await queryRunner.manager.update(
          destinationAccount.constructor,
          destinationAccount.id,
          { balance: destinationAccount.balance }
        );
      }

      await queryRunner.commitTransaction();

      return savedTransaction;
    } 
    catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; 
    } 
    finally {
      await queryRunner.release();
    }
  }
}
