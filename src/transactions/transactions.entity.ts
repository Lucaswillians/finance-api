import { AccountEntity } from 'src/accounts/account.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TransactionType } from './enum/transactionts.enum';
import { CurrencyEntity } from 'src/currency/currency.entity';

@Entity('transactions')
export class TransactionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => AccountEntity, (account) => account.transactions)
  account: AccountEntity;

  @ManyToOne(() => AccountEntity, { nullable: true })
  destinationAccount?: AccountEntity;

  @ManyToOne(() => CurrencyEntity, { eager: true }) 
  currency: CurrencyEntity;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  exchangeRate?: number; 

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountInBaseCurrency?: number;  

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
