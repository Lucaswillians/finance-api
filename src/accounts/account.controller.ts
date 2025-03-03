import { Controller, Post, Get, Param, Body, Put, Delete, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { CreateAccountDto } from './dto/createAccount.dto';
import { AccountsService } from './account.service';
import { UpdateAccountDto } from './dto/updateAccount.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AccountStatementService } from './accountStatement/accountStatement.service';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly accountsStatementService: AccountStatementService
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)  
 @Roles('admin')  
  async create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.createAccount(createAccountDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.accountsService.getAllAccounts();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.accountsService.getAccountById(id);
  }

  @Get(':id/statement')
  async getAccountStatement(@Param('id') accountId: string, @Query('startDate') startDate: string,
    @Query('endDate') endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format. Please provide dates in the format YYYY-MM-DD.');
    }

    return this.accountsStatementService.generateStatement(accountId, start, end);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)  
  @Roles('admin')  
  async update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.updateAccount(id, updateAccountDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)  
  @Roles('admin') 
  async remove(@Param('id') id: string) {
    return this.accountsService.deleteAccount(id);
  }
}
