import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { FreightSimulationStatus } from '../enums/freight-simulation-status.enum';
import { FREIGHT_SIMULATION_QUEUE } from '../freight.constants';
import { FreightGateway } from '../gateways/freight.gateway';
import { FreightSimulationJobData } from '../services/freight.service';
import { AwesomeApiService } from '../services/awesome-api.service';
import { FreightCalculationService } from '../services/freight-calculation.service';
import { FreightService } from '../services/freight.service';
import { ViaCepService } from '../services/viacep.service';

@Processor(FREIGHT_SIMULATION_QUEUE)
export class FreightProcessor extends WorkerHost {
  private readonly logger = new Logger(FreightProcessor.name);

  constructor(
    private readonly freightService: FreightService,
    private readonly calculationService: FreightCalculationService,
    private readonly viaCepService: ViaCepService,
    private readonly awesomeApiService: AwesomeApiService,
    private readonly freightGateway: FreightGateway,
  ) {
    super();
  }

  async process(job: Job<FreightSimulationJobData>): Promise<void> {
    const { simulationId, tenantId } = job.data;

    this.logger.log(`Processando simulação ${simulationId} do tenant ${tenantId}`);

    try {
      const simulation = await this.freightService.findByIdForProcessing(
        simulationId,
        tenantId,
      );

      await this.freightService.updateStatus(
        simulationId,
        tenantId,
        FreightSimulationStatus.PROCESSING,
      );

      const [origin, destination, usdBrlRate] = await Promise.all([
        this.viaCepService.fetchLocation(simulation.originCep),
        this.viaCepService.fetchLocation(simulation.destinationCep),
        this.awesomeApiService.fetchUsdBrlRate(),
      ]);

      const quotes = this.calculationService.calculateQuotes({
        weightKg: parseFloat(simulation.weightKg),
        lengthCm: parseFloat(simulation.lengthCm),
        widthCm: parseFloat(simulation.widthCm),
        heightCm: parseFloat(simulation.heightCm),
        cargoValue: parseFloat(simulation.cargoValue),
      });

      const results = {
        origin,
        destination,
        usdBrlRate,
        quotes,
      };

      await this.freightService.updateStatus(
        simulationId,
        tenantId,
        FreightSimulationStatus.DONE,
        results,
      );

      this.freightGateway.emitSimulationDone(simulationId, results);

      this.logger.log(`Simulação ${simulationId} concluída com sucesso`);
    } catch (error) {
      await this.freightService.updateStatus(
        simulationId,
        tenantId,
        FreightSimulationStatus.ERROR,
        null,
      );

      this.logger.error(`Erro ao processar simulação ${simulationId}`, error);
      throw error;
    }
  }
}
