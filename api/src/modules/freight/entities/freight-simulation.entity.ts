import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FreightSimulationStatus } from '../enums/freight-simulation-status.enum';
import { FreightSimulationResults } from '../interfaces/freight.interface';

@Entity('freight_simulations')
export class FreightSimulation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'origin_cep', type: 'varchar', length: 8 })
  originCep!: string;

  @Column({ name: 'destination_cep', type: 'varchar', length: 8 })
  destinationCep!: string;

  @Column({ name: 'weight_kg', type: 'decimal', precision: 10, scale: 3 })
  weightKg!: string;

  @Column({ name: 'length_cm', type: 'decimal', precision: 10, scale: 2 })
  lengthCm!: string;

  @Column({ name: 'width_cm', type: 'decimal', precision: 10, scale: 2 })
  widthCm!: string;

  @Column({ name: 'height_cm', type: 'decimal', precision: 10, scale: 2 })
  heightCm!: string;

  @Column({ name: 'cargo_value', type: 'decimal', precision: 12, scale: 2 })
  cargoValue!: string;

  @Column({ type: 'json', nullable: true })
  results!: FreightSimulationResults | null;

  @Column({
    type: 'enum',
    enum: FreightSimulationStatus,
    default: FreightSimulationStatus.PENDING,
  })
  status!: FreightSimulationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
