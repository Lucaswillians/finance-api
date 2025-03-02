import { AccountEntity } from 'src/accounts/account.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TransactionType } from './enum/transactionts.enum';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
