import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AccountsController } from './account.controller';
import { AccountsService } from './account.service';
import { AccountEntity } from './account.entity'; 
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity]), 
    JwtModule.register({
      secret: 'my_secret_key',
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  controllers: [AccountsController],
  providers: [AccountsService, JwtStrategy],
  exports: [AccountsService], 
})
export class AccountsModule { }
