import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ScheduledTransactionService } from './sheduleTransactions.service';
import { CreateScheduledTransactionDto } from './dto/scheduleTransactions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('scheduled-transactions')
export class ScheduledTransactionController {
  constructor(private readonly scheduledTransactionService: ScheduledTransactionService) { }

  @Post()
  @UseGuards(JwtAuthGuard) 
  async scheduleTransaction(
    @Body() createScheduledTransactionDto: CreateScheduledTransactionDto,
  ) {
    return await this.scheduledTransactionService.scheduleTransaction(createScheduledTransactionDto);
  }
}
