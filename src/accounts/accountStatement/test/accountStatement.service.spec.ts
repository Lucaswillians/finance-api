import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AccountStatementService } from '../accountStatement.service';
import { AccountEntity } from '../../../accounts/account.entity';
import { TransactionsEntity } from '../../../transactions/transactions.entity';
import { AccountStatementEntity } from '../accountStatement.entity';
import { TransactionType } from '../../../transactions/enum/transactionts.enum';  // Importando o TransactionType corretamente
import { AccountType } from '../../../accounts/enum/AccountType.enum';

describe('AccountStatementService', () => {
  let service: AccountStatementService;
  let accountRepository: Repository<AccountEntity>;
  let transactionRepository: Repository<TransactionsEntity>;
  let statementRepository: Repository<AccountStatementEntity>;

  const mockAccountRepository = {
    findOneOrFail: jest.fn(),
  };

  const mockTransactionRepository = {
    find: jest.fn(),
  };

  const mockStatementRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountStatementService,
        {
          provide: getRepositoryToken(AccountEntity),
          useValue: mockAccountRepository,
        },
        {
          provide: getRepositoryToken(TransactionsEntity),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(AccountStatementEntity),
          useValue: mockStatementRepository,
        },
      ],
    }).compile();

    service = module.get<AccountStatementService>(AccountStatementService);
    accountRepository = module.get<Repository<AccountEntity>>(getRepositoryToken(AccountEntity));
    transactionRepository = module.get<Repository<TransactionsEntity>>(getRepositoryToken(TransactionsEntity));
    statementRepository = module.get<Repository<AccountStatementEntity>>(getRepositoryToken(AccountStatementEntity));
  });

  it('should generate an account statement', async () => {
    const accountId = 'some-uuid';
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-31');

    const mockCurrency = {
      id: 'currency-id',
      code: 'USD',
      name: 'US Dollar',
      exchangeRate: 1.0,
    }; 

    const mockAccount: AccountEntity = {
      id: accountId,
      number: '123456789',
      balance: 1000,
      user_id: 'user-id',
      type: AccountType.SAVINGS, 
      transactions: [],
      accountStatements: [],
      created_at: new Date(),
      updated_at: new Date(),
      name: 'Mock Account', 
      scheduledTransactionsAsSource: [], 
      scheduledTransactionsAsDestination: [], 
      currency: mockCurrency, 
    };

    const mockTransactions: TransactionsEntity[] = [
      {
        id: 'txn1',
        account: mockAccount,
        type: TransactionType.DEPOSIT, 
        amount: 200,
        currency: mockCurrency, 
        createdAt: new Date('2025-01-05'),
        updatedAt: new Date(), 
      },
      {
        id: 'txn2',
        account: mockAccount,
        type: TransactionType.WITHDRAWAL, 
        amount: 50,
        currency: mockCurrency, 
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date(), 
      },
    ];

    const mockStatement: AccountStatementEntity = {
      id: 'statement-id', 
      account: mockAccount,
      start_balance: 1000,
      end_balance: 1150,
      total_deposits: 200,
      total_withdrawals: 50,
      start_date: startDate,
      end_date: endDate,
      createdAt: new Date(), 
    };

    mockAccountRepository.findOneOrFail.mockResolvedValue(mockAccount);
    mockTransactionRepository.find.mockResolvedValue(mockTransactions);
    mockStatementRepository.create.mockReturnValue(mockStatement);
    mockStatementRepository.save.mockResolvedValue(mockStatement);

    const result = await service.generateStatement(accountId, startDate, endDate);

    expect(mockAccountRepository.findOneOrFail).toHaveBeenCalledWith({
      where: { id: accountId },
      relations: ['transactions'],
    });

    expect(mockTransactionRepository.find).toHaveBeenCalledWith({
      where: {
        account: { id: accountId },
        createdAt: Between(startDate, endDate),
      },
    });

    expect(mockStatementRepository.save).toHaveBeenCalledWith(mockStatement);

    expect(result).toEqual(mockStatement);
  });
});
