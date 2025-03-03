import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/CreateTransactions.dto';
import { TransactionsEntity } from './transactions.entity';
import { TransactionType } from './enum/transactionts.enum';
import { AccountsService } from '../accounts/account.service';
import { CurrencyService } from '../currency/currency.service';
import Decimal from 'decimal.js';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

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
        this.logger.error(`Account with ID ${dto.accountId} not found`);
        throw new NotFoundException('Destiny account not found!');
      }

      const accountBalance = new Decimal(account.balance);
      const transactionAmount = new Decimal(dto.amount);

      if (dto.type === TransactionType.WITHDRAWAL && accountBalance.lessThan(transactionAmount)) {
        this.logger.error(`Insufficient balance in account ${dto.accountId} for withdrawal`);
        throw new BadRequestException('Insufficient balance!');
      }

      let amountInBaseCurrency = transactionAmount;
      let currency;

      if (dto.currencyCode && dto.currencyCode !== 'USD') {
        currency = await this.currencyService.getCurrencyByCode(dto.currencyCode);

        if (!currency) {
          this.logger.error(`Currency ${dto.currencyCode} not supported for conversion`);
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
          this.logger.error(`Destination account with ID ${dto.destinationAccountId} not found`);
          throw new NotFoundException('Destiny account not found!');
        }
      }

      if (dto.type === TransactionType.WITHDRAWAL) {
        account.balance = accountBalance.minus(transactionAmount).toNumber();
        this.logger.log(`Withdrawal of ${dto.amount} from account ${dto.accountId}`);
      }
      else if (dto.type === TransactionType.DEPOSIT) {
        account.balance = accountBalance.plus(transactionAmount).toNumber();
        this.logger.log(`Deposit of ${dto.amount} to account ${dto.accountId}`);
      }

      if (dto.type === TransactionType.TRANSFER && destinationAccount) {
        if (accountBalance.lessThan(transactionAmount)) {
          this.logger.error(`Insufficient balance in account ${dto.accountId} for transfer to account ${dto.destinationAccountId}`);
          throw new BadRequestException('Insufficient balance!');
        }

        const destinationAccountBalance = new Decimal(destinationAccount.balance);
        destinationAccount.balance = destinationAccountBalance.plus(transactionAmount).toNumber();

        account.balance = accountBalance.minus(transactionAmount).toNumber();
        this.logger.log(`Transfer of ${dto.amount} from account ${dto.accountId} to account ${dto.destinationAccountId}`);
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

      this.logger.log(`Transaction ${savedTransaction.id} created successfully`);
      return savedTransaction;
    }
    catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error creating transaction', error.stack);
      throw error;
    }
    finally {
      await queryRunner.release();
    }
  }
}
