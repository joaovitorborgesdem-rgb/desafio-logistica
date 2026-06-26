import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FREIGHT_SIMULATION_QUEUE } from './freight.constants';
import { FreightController } from './freight.controller';
import { FreightSimulation } from './entities/freight-simulation.entity';
import { FreightGateway } from './gateways/freight.gateway';
import { FreightProcessor } from './processors/freight.processor';
import { AwesomeApiService } from './services/awesome-api.service';
import { FreightCalculationService } from './services/freight-calculation.service';
import { FreightService } from './services/freight.service';
import { ViaCepService } from './services/viacep.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FreightSimulation]),
    BullModule.registerQueue({ name: FREIGHT_SIMULATION_QUEUE }),
  ],
  controllers: [FreightController],
  providers: [
    FreightService,
    FreightCalculationService,
    ViaCepService,
    AwesomeApiService,
    FreightProcessor,
    FreightGateway,
  ],
  exports: [FreightService],
})
export class FreightModule {}
