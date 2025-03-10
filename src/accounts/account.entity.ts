import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { TransactionsEntity } from '../transactions/transactions.entity';
import { AccountType } from './enum/AccountType.enum';
import { AccountStatementEntity } from './accountStatement/accountStatement.entity';
import { ScheduledTransactionEntity } from '../scheduleTransactions/scheduleTransactions.entity';
import { CurrencyEntity } from '../currency/currency.entity';

@Entity()
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  number: string;

  @Column({ type: 'decimal', default: 0 })
  balance: number;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.CHECKING,
  })
  type: AccountType;

  @Column()
  user_id: string;

  @OneToMany(() => TransactionsEntity, (transaction) => transaction.account)
  transactions: TransactionsEntity[];

  @OneToMany(() => AccountStatementEntity, (statement) => statement.account)
  accountStatements: AccountStatementEntity[];

  @ManyToOne(() => CurrencyEntity, { eager: true }) 
  currency: CurrencyEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => ScheduledTransactionEntity, (scheduledTransaction) => scheduledTransaction.account)
  scheduledTransactionsAsSource: ScheduledTransactionEntity[];

  @OneToMany(() => ScheduledTransactionEntity, (scheduledTransaction) => scheduledTransaction.destinationAccount)
  scheduledTransactionsAsDestination: ScheduledTransactionEntity[];
}
