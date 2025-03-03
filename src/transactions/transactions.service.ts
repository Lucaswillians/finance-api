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

    const account = await this.accountService.getAccountById(dto.accountId);
    if (!account) {
      throw new NotFoundException('Conta de origem não encontrada');
    }

    const accountBalance = new Decimal(account.balance);
    const transactionAmount = new Decimal(dto.amount);

    if (dto.type === TransactionType.WITHDRAWAL && accountBalance.lessThan(transactionAmount)) {
      throw new BadRequestException('Saldo insuficiente para saque!');
    }

    let amountInBaseCurrency = transactionAmount;
    let currency;

    if (dto.currencyCode && dto.currencyCode !== 'USD') {
      currency = await this.currencyService.getCurrencyByCode(dto.currencyCode);

      if (!currency) {
        throw new BadRequestException('Moeda não suportada para conversão');
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
        throw new NotFoundException('Conta de destino não encontrada');
      }
    }

    if (dto.type === TransactionType.WITHDRAWAL) {
      account.balance = accountBalance.minus(transactionAmount).toNumber();
      console.log(`Saque realizado. Novo saldo da conta de origem: ${account.balance}`);
    } 
    else if (dto.type === TransactionType.DEPOSIT) {
      account.balance = accountBalance.plus(transactionAmount).toNumber();
      console.log(`Depósito realizado. Novo saldo da conta de origem: ${account.balance}`);
    }

    if (dto.type === TransactionType.TRANSFER && destinationAccount) {
      if (accountBalance.lessThan(transactionAmount)) {
        throw new BadRequestException('Saldo insuficiente para transferência!');
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

    const savedTransaction = await this.transactionsRepository.save(transaction);

    await this.accountService.updateAccount(account.id, {
      balance: account.balance,
    });

    if (destinationAccount) {
      await this.accountService.updateAccount(destinationAccount.id, {
        balance: destinationAccount.balance,
      });
    }

    return savedTransaction;
  }
}
