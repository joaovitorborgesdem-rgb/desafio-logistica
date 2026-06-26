import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CarriersService } from './carriers.service';
import { Carrier } from './entities/carrier.entity';

describe('CarriersService', () => {
  let service: CarriersService;
  let carrierRepository: jest.Mocked<Repository<Carrier>>;

  const tenantId = 'tenant-uuid';

  const mockCarrier: Carrier = {
    id: 'carrier-uuid',
    tenantId,
    name: 'Transportadora Teste',
    document: '12345678000199',
    email: 'carrier@example.com',
    phone: '11988887777',
    city: 'Curitiba',
    state: 'PR',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarriersService,
        {
          provide: getRepositoryToken(Carrier),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CarriersService);
    carrierRepository = module.get(getRepositoryToken(Carrier));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar transportadora no tenant', async () => {
      carrierRepository.findOne.mockResolvedValue(null);
      carrierRepository.create.mockReturnValue(mockCarrier);
      carrierRepository.save.mockResolvedValue(mockCarrier);

      const result = await service.create(tenantId, {
        name: 'Transportadora Teste',
        document: '12345678000199',
      });

      expect(result.tenantId).toBe(tenantId);
    });

    it('deve lançar ConflictException para documento duplicado', async () => {
      carrierRepository.findOne.mockResolvedValue(mockCarrier);

      await expect(
        service.create(tenantId, {
          name: 'Outra',
          document: '12345678000199',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('deve listar transportadoras filtrando por tenant_id', async () => {
      carrierRepository.find.mockResolvedValue([mockCarrier]);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(1);
      expect(carrierRepository.find).toHaveBeenCalledWith({
        where: { tenantId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findById', () => {
    it('deve retornar transportadora do tenant', async () => {
      carrierRepository.findOne.mockResolvedValue(mockCarrier);

      const result = await service.findById(tenantId, 'carrier-uuid');

      expect(result.id).toBe('carrier-uuid');
    });

    it('deve lançar NotFoundException se não existir no tenant', async () => {
      carrierRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(tenantId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deve remover transportadora do tenant', async () => {
      carrierRepository.findOne.mockResolvedValue(mockCarrier);
      carrierRepository.remove.mockResolvedValue(mockCarrier);

      const result = await service.remove(tenantId, 'carrier-uuid');

      expect(result.message).toBe('Transportadora removida com sucesso');
    });
  });
});
