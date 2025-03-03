import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AccountEntity } from '../accounts/account.entity';
import { CurrencyEntity } from '../currency/currency.entity';  // Adicionar a importação de CurrencyEntity
import { TransactionType } from '../transactions/enum/transactionts.enum';

@Entity('scheduled_transactions')
export class ScheduledTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AccountEntity, { eager: true })
  account: AccountEntity;  

  @ManyToOne(() => AccountEntity, { eager: true })
  destinationAccount: AccountEntity;  

  @ManyToOne(() => CurrencyEntity, { eager: true })
  currency: CurrencyEntity;  

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;  

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  amountInBaseCurrency: number;  

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  exchangeRate: number;  

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;  

  @Column()
  frequency: string;  

  @Column()
  nextExecutionDate: Date;  

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
