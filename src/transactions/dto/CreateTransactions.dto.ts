import { IsDecimal, IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { TransactionType } from '../enum/transactionts.enum';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @IsDecimal()
  @Min(0.01)
  amount: number;

  @IsUUID()
  accountId: string;

  @IsUUID()
  @IsOptional()
  destinationAccountId?: string;
}
