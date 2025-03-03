import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/createAccount.dto';
import { UpdateAccountDto } from './dto/updateAccount.dto';
import { AccountEntity } from './account.entity';
import { CurrencyService } from '../currency/currency.service';  

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountsRepository: Repository<AccountEntity>,
    private readonly currencyService: CurrencyService,  
  ) { }

  async createAccount(createAccountDto: CreateAccountDto): Promise<AccountEntity> {
    const existingAccount = await this.accountsRepository.findOne({
      where: { number: createAccountDto.number },
    });

    if (existingAccount) {
      throw new BadRequestException(`Account with number ${createAccountDto.number} already exists.`);
    }

    if (!createAccountDto.currency) {
      throw new BadRequestException('Currency code must be provided.');
    }

    const currency = await this.currencyService.getCurrencyByCode(createAccountDto.currency);

    if (!currency) {
      throw new BadRequestException(`Currency with code ${createAccountDto.currency} not found.`);
    }

    const account = this.accountsRepository.create({
      ...createAccountDto,
      currency, 
    });

    return this.accountsRepository.save(account);
  }

  async getAllAccounts(): Promise<AccountEntity[]> {
    return this.accountsRepository.find();
  }

  async getAccountById(id: string): Promise<AccountEntity> {
    const account = await this.accountsRepository.findOne({ where: { id } });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async updateAccount(id: string, updateAccountDto: UpdateAccountDto): Promise<AccountEntity> {
    const account = await this.getAccountById(id);
    Object.assign(account, updateAccountDto);
    return this.accountsRepository.save(account);
  }

  async deleteAccount(id: string): Promise<void> {
    const account = await this.getAccountById(id);
    await this.accountsRepository.remove(account);
  }
}
