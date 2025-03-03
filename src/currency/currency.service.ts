import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from './currency.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger
  ) { }

  async getCurrencyByCode(code: string): Promise<CurrencyEntity> {
    this.logger.info(`Fetching currency by code: ${code}`); 
    const currency = await this.currencyRepository.findOne({ where: { code } });

    if (!currency) {
      this.logger.error(`Currency with code ${code} not found`); 
      throw new NotFoundException(`Currency ${code} not found`);
    }

    this.logger.info(`Currency with code ${code} found`); 
    return currency;
  }

  async updateExchangeRate(code: string, newRate: number): Promise<CurrencyEntity> {
    this.logger.info(`Updating exchange rate for currency ${code} to ${newRate}`); 
    const currency = await this.getCurrencyByCode(code);
    currency.exchangeRate = newRate;

    this.logger.info(`Exchange rate for currency ${code} updated to ${newRate}`); 
    return this.currencyRepository.save(currency);
  }
}
