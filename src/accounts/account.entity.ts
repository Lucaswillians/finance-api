import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AccountType } from './enum/AccountType.enum';
import { TransactionsEntity } from 'src/transactions/transactions.entity';

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

  @Column()
  currency: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
