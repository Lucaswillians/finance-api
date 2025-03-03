import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { ExchangeRateService } from './exchangeRate.service';

@Processor('exchange-rate-queue')
@Injectable()
export class ExchangeRateProcessor {
  private readonly logger = new Logger(ExchangeRateProcessor.name);

  constructor(private readonly exchangeRateService: ExchangeRateService) { }

  @Process('update-rates')
  async handleUpdateRates(job: Job) {
    this.logger.log('🔄 Processando atualização das taxas de câmbio...');
    try {
      await this.exchangeRateService.updateExchangeRates();
      this.logger.log('✅ Taxas de câmbio atualizadas com sucesso!');
    } catch (error) {
      this.logger.error('❌ Erro ao atualizar taxas de câmbio', error);
    }
  }
}
