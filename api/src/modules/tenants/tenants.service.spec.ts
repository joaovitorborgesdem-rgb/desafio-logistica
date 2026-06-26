import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { Tenant } from './entities/tenant.entity';

describe('TenantsService', () => {
  let service: TenantsService;
  let tenantRepository: jest.Mocked<Repository<Tenant>>;

  const mockTenant: Tenant = {
    id: 'tenant-uuid',
    name: 'Acme Logistics',
    slug: 'acme-logistics',
    active: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TenantsService);
    tenantRepository = module.get(getRepositoryToken(Tenant));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um tenant', async () => {
      tenantRepository.findOne.mockResolvedValue(null);
      tenantRepository.create.mockReturnValue(mockTenant);
      tenantRepository.save.mockResolvedValue(mockTenant);

      const result = await service.create({
        name: 'Acme Logistics',
        slug: 'acme-logistics',
      });

      expect(result.slug).toBe('acme-logistics');
    });

    it('deve lançar ConflictException para slug duplicado', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      await expect(
        service.create({ name: 'Other', slug: 'acme-logistics' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('deve retornar tenant existente', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findById('tenant-uuid', 'tenant-uuid');

      expect(result.id).toBe('tenant-uuid');
    });

    it('deve lançar NotFoundException se não existir', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('missing-uuid')).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException para tenant de outro usuário', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      await expect(
        service.findById('tenant-uuid', 'other-tenant-uuid'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('deve atualizar tenant', async () => {
      tenantRepository.findOne.mockResolvedValue({ ...mockTenant });
      tenantRepository.save.mockImplementation(async (entity) => entity as Tenant);

      const result = await service.update(
        'tenant-uuid',
        { name: 'Updated Name' },
        'tenant-uuid',
      );

      expect(result.name).toBe('Updated Name');
    });
  });
});
