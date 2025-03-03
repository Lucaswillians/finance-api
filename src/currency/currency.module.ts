import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyService } from './currency.service';
import { CurrencyEntity } from './currency.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyEntity])],  
  providers: [CurrencyService],
  exports: [CurrencyService], 
})
export class CurrencyModule { }
