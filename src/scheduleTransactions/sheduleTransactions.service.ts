import { AccountsService } from 'src/accounts/account.service';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduledTransactionEntity } from './scheduleTransactions.entity';
import { TransactionService } from 'src/transactions/transactions.service';
import { CreateScheduledTransactionDto } from './dto/scheduleTransactions.dto';
import { CurrencyService } from 'src/currency/currency.service';  

@Injectable()
export class ScheduledTransactionService {
  constructor(
    @InjectRepository(ScheduledTransactionEntity)
    private readonly scheduledTransactionRepository: Repository<ScheduledTransactionEntity>,
    @InjectQueue('scheduled-transactions') private readonly scheduledTransactionsQueue: Queue,
    private readonly accountService: AccountsService,
    private readonly transactionService: TransactionService,
    private readonly currencyService: CurrencyService,  
  ) { }

  async scheduleTransaction(
    dto: CreateScheduledTransactionDto,
  ): Promise<ScheduledTransactionEntity> {
    const account = await this.accountService.getAccountById(dto.accountId);
    const destinationAccount = await this.accountService.getAccountById(dto.destinationAccountId);

    const currency = dto.currencyCode === 'USD'
      ? await this.currencyService.getCurrencyByCode('USD')  
      : await this.currencyService.getCurrencyByCode(dto.currencyCode);  

    let amountInBaseCurrency = dto.amount;
    
    if (dto.currencyCode && dto.currencyCode !== 'USD') {
      const exchangeRate = currency.exchangeRate;  
      amountInBaseCurrency = dto.amount / exchangeRate;  
    }

    const scheduledTransaction = this.scheduledTransactionRepository.create({
      account,
      destinationAccount,
      amount: dto.amount,
      type: dto.type,
      frequency: dto.frequency,
      nextExecutionDate: new Date(dto.nextExecutionDate),
      currency: currency,  
      exchangeRate: currency.exchangeRate,  
      amountInBaseCurrency: amountInBaseCurrency,  
    });

    await this.scheduledTransactionRepository.save(scheduledTransaction);

    await this.scheduledTransactionsQueue.add({
      accountId: account.id,
      destinationAccountId: destinationAccount.id,
      amount: dto.amount,
      type: dto.type,
      currencyCode: dto.currencyCode,  
      amountInBaseCurrency: amountInBaseCurrency,  
    }, {
      delay: this.getDelayBeforeExecution(scheduledTransaction.nextExecutionDate),
      repeat: {
        cron: this.getCronExpression(dto.frequency),
      },
    });

    return scheduledTransaction;
  }

  getDelayBeforeExecution(nextExecutionDate: Date): number {
    const delay = nextExecutionDate.getTime() - Date.now();
    return delay > 0 ? delay : 0;
  }

  getCronExpression(frequency: string): string {
    switch (frequency) {
      case 'daily':
        return '0 0 * * *';
      case 'weekly':
        return '0 0 * * 0';
      case 'monthly':
        return '0 0 1 * *';
      default:
        return '';
    }
  }
}
