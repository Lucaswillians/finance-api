import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from './currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
  ) { }

  async getCurrencyByCode(code: string): Promise<CurrencyEntity> {
    const currency = await this.currencyRepository.findOne({ where: { code } });

    if (!currency) {
      throw new NotFoundException(`Currency ${code} not found`);
    }

    return currency;
  }

  async updateExchangeRate(code: string, newRate: number): Promise<CurrencyEntity> {
    const currency = await this.getCurrencyByCode(code);
    currency.exchangeRate = newRate;
    return this.currencyRepository.save(currency);
  }
}
