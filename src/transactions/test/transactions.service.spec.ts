import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionService } from '../transactions.service';
import { AccountsService } from '../../accounts/account.service';
import { CurrencyService } from '../../currency/currency.service';
import { TransactionsEntity } from '../transactions.entity';
import { CreateTransactionDto } from '../dto/CreateTransactions.dto';
import { TransactionType } from '../enum/transactionts.enum';
import { v4 as uuidv4 } from 'uuid';

describe('TransactionService', () => {
  let service: TransactionService;

  const mockAccountService = {
    getAccountById: jest.fn(),
  };

  const mockCurrencyService = {
    getCurrencyByCode: jest.fn(),
  };

  const mockQueryRunner = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),  
      update: jest.fn(),  
    },
  };

  const mockTransactionsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    manager: {
      connection: {
        createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner), 
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: AccountsService, useValue: mockAccountService },
        { provide: CurrencyService, useValue: mockCurrencyService },
        { provide: getRepositoryToken(TransactionsEntity), useValue: mockTransactionsRepository },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should throw error if account not found for transfer', async () => {
    const dto: CreateTransactionDto = {
      accountId: uuidv4(),
      amount: 100,
      type: TransactionType.TRANSFER,
      currencyCode: 'USD',
    };

    mockAccountService.getAccountById.mockResolvedValue(null);

    await expect(service.createTransaction(dto)).rejects.toThrow(NotFoundException);
  });
});
