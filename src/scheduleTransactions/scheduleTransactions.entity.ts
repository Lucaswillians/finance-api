import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AccountEntity } from 'src/accounts/account.entity';
import { TransactionType } from 'src/transactions/enum/transactionts.enum';

@Entity('scheduled_transactions')
export class ScheduledTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AccountEntity, { eager: true })
  account: AccountEntity; 

  @ManyToOne(() => AccountEntity, { eager: true })
  destinationAccount: AccountEntity; 

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

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
