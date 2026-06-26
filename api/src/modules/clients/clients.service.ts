import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(tenantId: string, dto: CreateClientDto): Promise<Client> {
    const existing = await this.clientRepository.findOne({
      where: { tenantId, document: dto.document },
    });

    if (existing) {
      throw new ConflictException('Documento já cadastrado neste tenant');
    }

    const client = this.clientRepository.create({
      tenantId,
      name: dto.name,
      email: dto.email.toLowerCase(),
      phone: dto.phone ?? null,
      document: dto.document,
      city: dto.city ?? null,
      state: dto.state?.toUpperCase() ?? null,
    });

    const saved = await this.clientRepository.save(client);
    this.logger.log(`Cliente criado: ${saved.id} no tenant ${tenantId}`);

    return saved;
  }

  async findAll(tenantId: string): Promise<Client[]> {
    return this.clientRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(tenantId: string, id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id, tenantId },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return client;
  }

  async update(tenantId: string, id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findById(tenantId, id);

    if (dto.document && dto.document !== client.document) {
      const existing = await this.clientRepository.findOne({
        where: { tenantId, document: dto.document },
      });

      if (existing) {
        throw new ConflictException('Documento já cadastrado neste tenant');
      }
    }

    Object.assign(client, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.email !== undefined && { email: dto.email.toLowerCase() }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.document !== undefined && { document: dto.document }),
      ...(dto.city !== undefined && { city: dto.city }),
      ...(dto.state !== undefined && { state: dto.state.toUpperCase() }),
    });

    const saved = await this.clientRepository.save(client);
    this.logger.log(`Cliente atualizado: ${saved.id} no tenant ${tenantId}`);

    return saved;
  }

  async remove(tenantId: string, id: string): Promise<{ message: string }> {
    const client = await this.findById(tenantId, id);
    await this.clientRepository.remove(client);
    this.logger.log(`Cliente removido: ${id} no tenant ${tenantId}`);

    return { message: 'Cliente removido com sucesso' };
  }
}
