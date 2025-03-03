import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from '../currency.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from '../currency.entity';
import { NotFoundException } from '@nestjs/common';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let currencyRepository: Repository<CurrencyEntity>;

  const mockCurrencyRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: getRepositoryToken(CurrencyEntity),
          useValue: mockCurrencyRepository,
        },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
    currencyRepository = module.get<Repository<CurrencyEntity>>(getRepositoryToken(CurrencyEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrencyByCode', () => {
    it('should return a currency by code', async () => {
      const mockCurrency = new CurrencyEntity();
      mockCurrency.id = 'currency-id';
      mockCurrency.code = 'USD';
      mockCurrency.name = 'US Dollar';
      mockCurrency.exchangeRate = 1.0;

      mockCurrencyRepository.findOne.mockResolvedValue(mockCurrency);

      const result = await service.getCurrencyByCode('USD');
      expect(result).toEqual(mockCurrency);
      expect(mockCurrencyRepository.findOne).toHaveBeenCalledWith({ where: { code: 'USD' } });
    });

    it('should throw a NotFoundException if currency is not found', async () => {
      mockCurrencyRepository.findOne.mockResolvedValue(null);

      try {
        await service.getCurrencyByCode('EUR');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Currency EUR not found');
      }
    });
  });

  describe('updateExchangeRate', () => {
    it('should update the exchange rate of a currency', async () => {
      const mockCurrency = new CurrencyEntity();
      mockCurrency.id = 'currency-id';
      mockCurrency.code = 'USD';
      mockCurrency.name = 'US Dollar';
      mockCurrency.exchangeRate = 1.0;

      mockCurrencyRepository.findOne.mockResolvedValue(mockCurrency);
      mockCurrencyRepository.save.mockResolvedValue({ ...mockCurrency, exchangeRate: 1.2 });

      const result = await service.updateExchangeRate('USD', 1.2);
      expect(result.exchangeRate).toBe(1.2);
      expect(mockCurrencyRepository.save).toHaveBeenCalledWith(mockCurrency);
    });

    it('should throw a NotFoundException if currency is not found', async () => {
      mockCurrencyRepository.findOne.mockResolvedValue(null);

      try {
        await service.updateExchangeRate('EUR', 1.2);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Currency EUR not found');
      }
    });
  });
});
