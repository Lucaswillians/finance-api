import { IsEnum, IsNotEmpty, IsString, IsDecimal, MaxLength, MinLength } from 'class-validator';
import { AccountType } from '../enum/AccountType.enum';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(20)
  number: string;

  @IsDecimal()
  balance: number;

  @IsEnum(AccountType)
  type: AccountType;

  @IsString()
  @IsNotEmpty()
  currency: string;
}
