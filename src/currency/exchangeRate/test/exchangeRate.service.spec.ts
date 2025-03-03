import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRateService } from '../exchangeRate.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { CurrencyEntity } from '../../../currency/currency.entity';

const mockCurrencyRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(), 
};

const mockExchangeRateQueue = {
  add: jest.fn(),
};

describe('ExchangeRateService - Simple Test', () => {
  let service: ExchangeRateService;
  let currencyRepository: Repository<CurrencyEntity>;
  let exchangeRateQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRateService,
        {
          provide: getRepositoryToken(CurrencyEntity),
          useValue: mockCurrencyRepository,
        },
        {
          provide: 'BullQueue_exchange-rate-queue',
          useValue: mockExchangeRateQueue,
        },
      ],
    }).compile();

    service = module.get<ExchangeRateService>(ExchangeRateService);
    currencyRepository = module.get<Repository<CurrencyEntity>>(getRepositoryToken(CurrencyEntity));
    exchangeRateQueue = module.get<Queue>('BullQueue_exchange-rate-queue');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call currencyRepository.find when updating exchange rates', async () => {
    mockCurrencyRepository.find.mockResolvedValue([{ code: 'USD', exchangeRate: 1 }]);

    await service.updateExchangeRates();

    expect(mockCurrencyRepository.find).toHaveBeenCalled();
  });

  it('should call currencyRepository.save when updating exchange rates', async () => {
    mockCurrencyRepository.find.mockResolvedValue([{ code: 'USD', exchangeRate: 1 }]);

    mockCurrencyRepository.findOne.mockResolvedValue({ code: 'USD', exchangeRate: 1 });

    await service.updateExchangeRates();

    expect(mockCurrencyRepository.save).toHaveBeenCalled();
  });

  it('should add a job to the queue when initializing module', async () => {
    await service.onModuleInit();

    expect(mockExchangeRateQueue.add).toHaveBeenCalledWith('update-rates', {}, { repeat: { every: 30000 } });
  });
});
