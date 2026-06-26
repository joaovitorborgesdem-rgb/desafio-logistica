import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';

describe('ClientsService', () => {
  let service: ClientsService;
  let clientRepository: jest.Mocked<Repository<Client>>;

  const tenantId = 'tenant-uuid';

  const mockClient: Client = {
    id: 'client-uuid',
    tenantId,
    name: 'Cliente Teste',
    email: 'cliente@example.com',
    phone: '11999999999',
    document: '12345678901',
    city: 'São Paulo',
    state: 'SP',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
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

    service = module.get(ClientsService);
    clientRepository = module.get(getRepositoryToken(Client));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar cliente no tenant', async () => {
      clientRepository.findOne.mockResolvedValue(null);
      clientRepository.create.mockReturnValue(mockClient);
      clientRepository.save.mockResolvedValue(mockClient);

      const result = await service.create(tenantId, {
        name: 'Cliente Teste',
        email: 'cliente@example.com',
        document: '12345678901',
      });

      expect(result.tenantId).toBe(tenantId);
    });

    it('deve lançar ConflictException para documento duplicado', async () => {
      clientRepository.findOne.mockResolvedValue(mockClient);

      await expect(
        service.create(tenantId, {
          name: 'Outro',
          email: 'outro@example.com',
          document: '12345678901',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('deve listar clientes filtrando por tenant_id', async () => {
      clientRepository.find.mockResolvedValue([mockClient]);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(1);
      expect(clientRepository.find).toHaveBeenCalledWith({
        where: { tenantId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findById', () => {
    it('deve retornar cliente do tenant', async () => {
      clientRepository.findOne.mockResolvedValue(mockClient);

      const result = await service.findById(tenantId, 'client-uuid');

      expect(result.id).toBe('client-uuid');
    });

    it('deve lançar NotFoundException se não existir no tenant', async () => {
      clientRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(tenantId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deve remover cliente do tenant', async () => {
      clientRepository.findOne.mockResolvedValue(mockClient);
      clientRepository.remove.mockResolvedValue(mockClient);

      const result = await service.remove(tenantId, 'client-uuid');

      expect(result.message).toBe('Cliente removido com sucesso');
    });
  });
});
