import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { ListSimulationsQueryDto } from '../dto/list-simulations-query.dto';
import { SimulateFreightDto } from '../dto/simulate-freight.dto';
import { FreightSimulation } from '../entities/freight-simulation.entity';
import { FreightSimulationStatus } from '../enums/freight-simulation-status.enum';
import { FREIGHT_SIMULATION_QUEUE } from '../freight.constants';
import { FreightSimulationResults } from '../interfaces/freight.interface';

export interface PaginatedSimulations {
  data: FreightSimulation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SimulationCreatedResponse {
  id: string;
  status: FreightSimulationStatus;
}

export interface FreightSimulationJobData {
  simulationId: string;
  tenantId: string;
}

@Injectable()
export class FreightService {
  private readonly logger = new Logger(FreightService.name);

  constructor(
    @InjectRepository(FreightSimulation)
    private readonly simulationRepository: Repository<FreightSimulation>,
    @InjectQueue(FREIGHT_SIMULATION_QUEUE)
    private readonly freightQueue: Queue<FreightSimulationJobData>,
  ) {}

  async createSimulation(
    tenantId: string,
    userId: string,
    dto: SimulateFreightDto,
  ): Promise<SimulationCreatedResponse> {
    const simulation = this.simulationRepository.create({
      tenantId,
      userId,
      originCep: dto.originCep,
      destinationCep: dto.destinationCep,
      weightKg: dto.weightKg.toString(),
      lengthCm: dto.lengthCm.toString(),
      widthCm: dto.widthCm.toString(),
      heightCm: dto.heightCm.toString(),
      cargoValue: dto.cargoValue.toString(),
      status: FreightSimulationStatus.PENDING,
      results: null,
    });

    const saved = await this.simulationRepository.save(simulation);

    await this.freightQueue.add(
      'process-simulation',
      { simulationId: saved.id, tenantId },
      { removeOnComplete: true, removeOnFail: false },
    );

    this.logger.log(`Simulação ${saved.id} enfileirada no tenant ${tenantId}`);

    return { id: saved.id, status: saved.status };
  }

  async findAll(
    tenantId: string,
    query: ListSimulationsQueryDto,
  ): Promise<PaginatedSimulations> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.simulationRepository.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(tenantId: string, id: string): Promise<FreightSimulation> {
    const simulation = await this.simulationRepository.findOne({
      where: { id, tenantId },
    });

    if (!simulation) {
      throw new NotFoundException('Simulação não encontrada');
    }

    return simulation;
  }

  async findByIdForProcessing(
    simulationId: string,
    tenantId: string,
  ): Promise<FreightSimulation> {
    const simulation = await this.simulationRepository.findOne({
      where: { id: simulationId, tenantId },
    });

    if (!simulation) {
      throw new NotFoundException('Simulação não encontrada');
    }

    return simulation;
  }

  async updateStatus(
    simulationId: string,
    tenantId: string,
    status: FreightSimulationStatus,
    results?: FreightSimulationResults | null,
  ): Promise<FreightSimulation> {
    const simulation = await this.findByIdForProcessing(simulationId, tenantId);

    simulation.status = status;

    if (results !== undefined) {
      simulation.results = results;
    }

    const saved = await this.simulationRepository.save(simulation);
    this.logger.log(`Simulação ${simulationId} atualizada para ${status}`);

    return saved;
  }
}
