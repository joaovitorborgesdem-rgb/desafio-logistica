import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { NotFoundException } from '@nestjs/common';
import { FreightService } from './freight.service';
import { FreightSimulation } from '../entities/freight-simulation.entity';
import { FreightSimulationStatus } from '../enums/freight-simulation-status.enum';
import { FREIGHT_SIMULATION_QUEUE } from '../freight.constants';

describe('FreightService', () => {
  let service: FreightService;
  let simulationRepository: jest.Mocked<Repository<FreightSimulation>>;
  let freightQueue: jest.Mocked<Queue>;

  const tenantId = 'tenant-uuid';
  const userId = 'user-uuid';

  const mockSimulation: FreightSimulation = {
    id: 'simulation-uuid',
    tenantId,
    userId,
    originCep: '01310100',
    destinationCep: '80010000',
    weightKg: '10.000',
    lengthCm: '30.00',
    widthCm: '20.00',
    heightCm: '15.00',
    cargoValue: '1500.00',
    results: null,
    status: FreightSimulationStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FreightService,
        {
          provide: getRepositoryToken(FreightSimulation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getQueueToken(FREIGHT_SIMULATION_QUEUE),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(FreightService);
    simulationRepository = module.get(getRepositoryToken(FreightSimulation));
    freightQueue = module.get(getQueueToken(FREIGHT_SIMULATION_QUEUE));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSimulation', () => {
    it('deve salvar simulação PENDING e enfileirar job', async () => {
      simulationRepository.create.mockReturnValue(mockSimulation);
      simulationRepository.save.mockResolvedValue(mockSimulation);
      freightQueue.add.mockResolvedValue({} as never);

      const result = await service.createSimulation(tenantId, userId, {
        originCep: '01310100',
        destinationCep: '80010000',
        weightKg: 10,
        lengthCm: 30,
        widthCm: 20,
        heightCm: 15,
        cargoValue: 1500,
      });

      expect(result).toEqual({
        id: 'simulation-uuid',
        status: FreightSimulationStatus.PENDING,
      });
      expect(freightQueue.add).toHaveBeenCalledWith(
        'process-simulation',
        { simulationId: 'simulation-uuid', tenantId },
        expect.any(Object),
      );
    });
  });

  describe('findAll', () => {
    it('deve listar simulações paginadas filtrando por tenant_id', async () => {
      simulationRepository.findAndCount.mockResolvedValue([[mockSimulation], 1]);

      const result = await service.findAll(tenantId, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(simulationRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId } }),
      );
    });
  });

  describe('findById', () => {
    it('deve retornar simulação do tenant', async () => {
      simulationRepository.findOne.mockResolvedValue(mockSimulation);

      const result = await service.findById(tenantId, 'simulation-uuid');

      expect(result.id).toBe('simulation-uuid');
    });

    it('deve lançar NotFoundException se não existir no tenant', async () => {
      simulationRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(tenantId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar status e results', async () => {
      simulationRepository.findOne.mockResolvedValue({ ...mockSimulation });
      simulationRepository.save.mockImplementation(async (entity) => entity as FreightSimulation);

      const results = {
        origin: { cep: '01310100' },
        destination: { cep: '80010000' },
        usdBrlRate: 5.5,
        quotes: [],
      };

      const result = await service.updateStatus(
        'simulation-uuid',
        tenantId,
        FreightSimulationStatus.DONE,
        results,
      );

      expect(result.status).toBe(FreightSimulationStatus.DONE);
      expect(result.results).toEqual(results);
    });
  });
});
