import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrencyService } from '../currency.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly currencyService: CurrencyService) { }

  @Get(':code')
  @UseGuards(JwtAuthGuard) 
  async getExchangeRate(@Param('code') code: string) {
    const currency = await this.currencyService.getCurrencyByCode(code);
    return { code: currency.code, rate: currency.exchangeRate };
  }
}
