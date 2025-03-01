import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AccountType } from './enum/AccountType.enum';

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

  @Column()
  currency: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
