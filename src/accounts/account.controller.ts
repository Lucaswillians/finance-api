import { Controller, Post, Get, Param, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { CreateAccountDto } from './dto/createAccount.dto';
import { AccountsService } from './account.service';
import { UpdateAccountDto } from './dto/updateAccount.dto';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) { }

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
