import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { TransactionService } from '../transactions/transactions.service';

@Processor('scheduled-transactions')
export class ScheduledTransactionProcessor {
  constructor(
    private readonly transactionService: TransactionService,
  ) { }

  @Process()
  async handleScheduledTransaction(job: Job) {
    const { accountId, destinationAccountId, amount, type, currencyCode } = job.data;

    await this.transactionService.createTransaction({
      accountId,
      destinationAccountId,
      amount,
      type,
      currencyCode, 
    });
  }
}
