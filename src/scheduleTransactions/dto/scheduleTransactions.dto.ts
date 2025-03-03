import { IsNotEmpty, IsNumber, IsEnum, IsDateString, IsString } from 'class-validator';
import { TransactionType } from 'src/transactions/enum/transactionts.enum';

export class CreateScheduledTransactionDto {
  @IsNotEmpty()
  accountId: string;

  @IsNotEmpty()
  destinationAccountId: string;

  @IsNumber()
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  frequency: string; 

  @IsDateString()
  nextExecutionDate: string;

  @IsString()
  currencyCode: string;
}
