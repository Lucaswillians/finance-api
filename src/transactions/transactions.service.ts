import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountsService } from 'src/accounts/account.service';
import { CreateTransactionDto } from './dto/CreateTransactions.dto';
import { TransactionsEntity } from './transactions.entity';
import { TransactionType } from './enum/transactionts.enum';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionsEntity)
    private readonly transactionsRepository: Repository<TransactionsEntity>,
    private accountService: AccountsService,
  ) { }

  async createTransaction(dto: CreateTransactionDto): Promise<TransactionsEntity> {
    const account = await this.accountService.getAccountById(dto.accountId);

    if (dto.type === TransactionType.WITHDRAWAL && account.balance < dto.amount) {
      throw new BadRequestException('Insufficient balance!');
    }

    if (dto.type === TransactionType.TRANSFER) {
      if (!dto.destinationAccountId) {
        throw new BadRequestException('Mandatory destination account for transfer!');
      }

      const destinationAccount = await this.accountService.getAccountById(dto.destinationAccountId);

      if (!destinationAccount) {
        throw new NotFoundException('Destination account not found!');
      }

      if (account.balance < dto.amount) {
        throw new BadRequestException('Insufficient balance!');
      }

      account.balance = parseFloat(account.balance.toString()) - parseFloat(dto.amount.toString());
      destinationAccount.balance = parseFloat(destinationAccount.balance.toString()) + parseFloat(dto.amount.toString());

      await this.accountService.updateAccount(account.id, { balance: account.balance });
      await this.accountService.updateAccount(destinationAccount.id, { balance: destinationAccount.balance });
    } 
    else {
      if (dto.type === TransactionType.DEPOSIT) {
        account.balance = parseFloat(account.balance.toString()) + parseFloat(dto.amount.toString()); 
      } 
      else if (dto.type === TransactionType.WITHDRAWAL) {
        account.balance = parseFloat(account.balance.toString()) - parseFloat(dto.amount.toString()); 
      }

      await this.accountService.updateAccount(account.id, { balance: account.balance });
    }

    const transaction = this.transactionsRepository.create({
      type: dto.type,
      amount: dto.amount,
      account: account,
      destinationAccount: dto.destinationAccountId ? await this.accountService.getAccountById(dto.destinationAccountId) : undefined,
    });

    return await this.transactionsRepository.save(transaction);
  }
}
