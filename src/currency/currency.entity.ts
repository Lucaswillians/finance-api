import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('currencies')
export class CurrencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; 

  @Column()
  name: string; 

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
  exchangeRate: number; 
}
