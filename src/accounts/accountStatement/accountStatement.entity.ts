import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { AccountEntity } from 'src/accounts/account.entity';

@Entity('account_statements')
export class AccountStatementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AccountEntity, (account) => account.accountStatements)
  account: AccountEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  start_balance: number; 

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  end_balance: number; 

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_deposits: number; 

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_withdrawals: number;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date; 

  @CreateDateColumn()
  createdAt: Date;
}
