import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyService } from './currency.service';
import { CurrencyEntity } from './currency.entity'; 
import { WinstonModule } from 'nest-winston';
import { appLogger } from 'src/Logger';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyEntity]), WinstonModule.forRoot(appLogger)],  
  providers: [CurrencyService],
  exports: [CurrencyService], 
})
export class CurrencyModule { }
