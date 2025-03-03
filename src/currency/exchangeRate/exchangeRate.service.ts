import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from '../currency.entity';

interface ExchangeRateApiResponse {
  rates: { [key: string]: number }; 
}

@Injectable()
export class ExchangeRateService implements OnModuleInit {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,

    @InjectQueue('exchange-rate-queue') 
    private readonly exchangeRateQueue: Queue,
  ) { }

  private async createDefaultCurrencies(): Promise<void> {
    const currencies = [
      { code: 'USD', name: 'Dólar Americano' },
      { code: 'BRL', name: 'Real Brasileiro' },
      { code: 'EUR', name: 'Euro' },
      { code: 'GBP', name: 'Libra Esterlina' }
    ];

    for (const currency of currencies) {
      const existingCurrency = await this.currencyRepository.findOne({ where: { code: currency.code } });
      if (!existingCurrency) {
        const newCurrency = this.currencyRepository.create({
          code: currency.code,
          name: currency.name,  
          exchangeRate: currency.code === 'USD' ? 1 : 0, 
        });
        await this.currencyRepository.save(newCurrency);
        this.logger.log(`Moeda ${currency.code} criada com sucesso!`);
      }
    }
  }

  async updateExchangeRates(): Promise<void> {
    this.logger.log('🔄 Atualizando taxas de câmbio...');

    try {
      await this.createDefaultCurrencies();

      const apiUrl = 'https://api.exchangerate-api.com/v4/latest/USD';
      const response = await axios.get<ExchangeRateApiResponse>(apiUrl); 

      if (!response.data || !response.data.rates) {
        throw new Error('Resposta inválida da API de câmbio');
      }

      const rates = response.data.rates;
      const currencies = await this.currencyRepository.find();

      for (const currency of currencies) {
        if (rates[currency.code]) {
          currency.exchangeRate = rates[currency.code];
        }
      }

      await this.currencyRepository.save(currencies);
      this.logger.log('✅ Taxas de câmbio atualizadas com sucesso!');
    } 
    catch (error) {
      this.logger.error('❌ Erro ao atualizar taxas de câmbio', error);
    }
  }

  async onModuleInit() {
    await this.exchangeRateQueue.add('update-rates', {}, { repeat: { every: 30000 } }); 
    this.logger.log('⏳ Job de atualização de câmbio agendado para cada 30 segundos.');
  }
}
