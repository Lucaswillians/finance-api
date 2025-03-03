import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from '../..//currency/currency.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'; // Para gerar UUIDs falsos
import { AccountsService } from '../account.service';
import { AccountEntity } from '../account.entity';
import { CreateAccountDto } from '../dto/createAccount.dto';
import { AccountType } from '../enum/AccountType.enum';


describe('AccountsService', () => {
  let service: AccountsService;
  let accountsRepository: Repository<AccountEntity>;
  let currencyService: CurrencyService;

  const mockAccountRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
  };

  const mockCurrencyService = {
    getCurrencyByCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(AccountEntity),
          useValue: mockAccountRepository,
        },
        {
          provide: CurrencyService,
          useValue: mockCurrencyService,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    accountsRepository = module.get<Repository<AccountEntity>>(getRepositoryToken(AccountEntity));
    currencyService = module.get<CurrencyService>(CurrencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should successfully create an account', async () => {
      const createAccountDto: CreateAccountDto = {
        number: '12345',
        currency: 'USD',
      };

      const mockCurrency = {
        id: uuidv4(),
        code: 'USD',
        name: 'US Dollar',
        exchangeRate: 1.0,
      };

      const mockAccount: AccountEntity = {
        id: uuidv4(),
        number: '12345',
        currency: mockCurrency,
        user_id: uuidv4(), 
        balance: 0,
        type: AccountType.SAVINGS, 
        transactions: [],
        accountStatements: [],
        scheduledTransactionsAsSource: [], 
        scheduledTransactionsAsDestination: [], 
        name: 'My Account', 
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCurrencyService.getCurrencyByCode.mockResolvedValue(mockCurrency);
      mockAccountRepository.findOne.mockResolvedValue(null); 

      mockAccountRepository.create.mockReturnValue(mockAccount);
      mockAccountRepository.save.mockResolvedValue(mockAccount);

      const result = await service.createAccount(createAccountDto);

      expect(mockCurrencyService.getCurrencyByCode).toHaveBeenCalledWith('USD');
      expect(mockAccountRepository.save).toHaveBeenCalledWith(mockAccount);
      expect(result).toEqual(mockAccount);
    });

    it('should throw an error if the account already exists', async () => {
      const createAccountDto: CreateAccountDto = {
        number: '12345',
        currency: 'USD',
      };

      const mockCurrency = {
        id: uuidv4(),
        code: 'USD',
        name: 'US Dollar',
        exchangeRate: 1.0, 
      };

      const mockAccount: AccountEntity = {
        id: uuidv4(),
        number: '12345',
        currency: mockCurrency,
        user_id: uuidv4(),
        balance: 0,
        type: AccountType.SAVINGS, 
        transactions: [],
        accountStatements: [],
        scheduledTransactionsAsSource: [],
        scheduledTransactionsAsDestination: [],
        name: 'My Account', 
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount); 

      await expect(service.createAccount(createAccountDto)).rejects.toThrowError(
        new BadRequestException('Account with number 12345 already exists.')
      );
    });
  });

  describe('getAccountById', () => {
    it('should return an account by UUID', async () => {
      const mockCurrency = {
        id: uuidv4(),
        code: 'USD',
        name: 'US Dollar',
        exchangeRate: 1.0, 
      };

      const mockAccount: AccountEntity = {
        id: uuidv4(),
        number: '12345',
        currency: mockCurrency,
        user_id: uuidv4(),
        balance: 0,
        type: AccountType.SAVINGS, 
        transactions: [],
        accountStatements: [],
        scheduledTransactionsAsSource: [],
        scheduledTransactionsAsDestination: [],
        name: 'My Account', 
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.getAccountById(mockAccount.id);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({ where: { id: mockAccount.id } });
      expect(result).toEqual(mockAccount);
    });

    it('should throw an error if account not found', async () => {
      const fakeUuid = uuidv4();
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.getAccountById(fakeUuid)).rejects.toThrowError(
        new NotFoundException(`Account with ID ${fakeUuid} not found`)
      );
    });
  });

  describe('deleteAccount', () => {
    it('should delete an account successfully', async () => {
      const mockCurrency = {
        id: uuidv4(),
        code: 'USD',
        name: 'US Dollar',
        exchangeRate: 1.0, 
      };

      const mockAccount: AccountEntity = {
        id: uuidv4(),
        number: '12345',
        currency: mockCurrency,
        user_id: uuidv4(),
        balance: 0,
        type: AccountType.SAVINGS, 
        transactions: [],
        accountStatements: [],
        scheduledTransactionsAsSource: [],
        scheduledTransactionsAsDestination: [],
        name: 'My Account', 
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockAccountRepository.remove.mockResolvedValue(mockAccount);

      await service.deleteAccount(mockAccount.id);

      expect(mockAccountRepository.remove).toHaveBeenCalledWith(mockAccount);
    });

    it('should throw an error if account not found', async () => {
      const fakeUuid = uuidv4();
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteAccount(fakeUuid)).rejects.toThrowError(
        new NotFoundException(`Account with ID ${fakeUuid} not found`)
      );
    });
  });
});
