import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/createAccount.dto';
import { UpdateAccountDto } from './dto/updateAccount.dto';
import { AccountEntity } from './account.entity';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

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
      this.logger.error(`Account with number ${createAccountDto.number} already exists.`);
      throw new BadRequestException(`Account with number ${createAccountDto.number} already exists.`);
    }

    if (!createAccountDto.currency) {
      this.logger.error('Currency code must be provided.');
      throw new BadRequestException('Currency code must be provided.');
    }

    const currency = await this.currencyService.getCurrencyByCode(createAccountDto.currency);

    if (!currency) {
      this.logger.error(`Currency with code ${createAccountDto.currency} not found.`);
      throw new BadRequestException(`Currency with code ${createAccountDto.currency} not found.`);
    }

    const account = this.accountsRepository.create({
      ...createAccountDto,
      currency,
    });

    const savedAccount = await this.accountsRepository.save(account);
    this.logger.log(`Account with number ${createAccountDto.number} created successfully.`);
    return savedAccount;
  }

  async getAllAccounts(): Promise<AccountEntity[]> {
    const accounts = await this.accountsRepository.find();
    this.logger.log(`Retrieved ${accounts.length} accounts.`);
    return accounts;
  }

  async getAccountById(id: string): Promise<AccountEntity> {
    const account = await this.accountsRepository.findOne({ where: { id } });

    if (!account) {
      this.logger.error(`Account with ID ${id} not found.`);
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    this.logger.log(`Account with ID ${id} found.`);
    return account;
  }

  async updateAccount(id: string, updateAccountDto: UpdateAccountDto): Promise<AccountEntity> {
    const account = await this.getAccountById(id);
    Object.assign(account, updateAccountDto);
    const updatedAccount = await this.accountsRepository.save(account);
    this.logger.log(`Account with ID ${id} updated successfully.`);
    return updatedAccount;
  }

  async deleteAccount(id: string): Promise<void> {
    const account = await this.getAccountById(id);
    await this.accountsRepository.remove(account);
    this.logger.log(`Account with ID ${id} deleted successfully.`);
  }
}
