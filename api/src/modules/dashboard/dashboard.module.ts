import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreightSimulation } from '../freight/entities/freight-simulation.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([FreightSimulation])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
