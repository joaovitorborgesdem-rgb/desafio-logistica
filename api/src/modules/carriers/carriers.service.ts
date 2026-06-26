import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';
import { Carrier } from './entities/carrier.entity';

@Injectable()
export class CarriersService {
  private readonly logger = new Logger(CarriersService.name);

  constructor(
    @InjectRepository(Carrier)
    private readonly carrierRepository: Repository<Carrier>,
  ) {}

  async create(tenantId: string, dto: CreateCarrierDto): Promise<Carrier> {
    const existing = await this.carrierRepository.findOne({
      where: { tenantId, document: dto.document },
    });

    if (existing) {
      throw new ConflictException('Documento já cadastrado neste tenant');
    }

    const carrier = this.carrierRepository.create({
      tenantId,
      name: dto.name,
      document: dto.document,
      email: dto.email?.toLowerCase() ?? null,
      phone: dto.phone ?? null,
      city: dto.city ?? null,
      state: dto.state?.toUpperCase() ?? null,
      active: dto.active ?? true,
    });

    const saved = await this.carrierRepository.save(carrier);
    this.logger.log(`Transportadora criada: ${saved.id} no tenant ${tenantId}`);

    return saved;
  }

  async findAll(tenantId: string): Promise<Carrier[]> {
    return this.carrierRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(tenantId: string, id: string): Promise<Carrier> {
    const carrier = await this.carrierRepository.findOne({
      where: { id, tenantId },
    });

    if (!carrier) {
      throw new NotFoundException('Transportadora não encontrada');
    }

    return carrier;
  }

  async update(tenantId: string, id: string, dto: UpdateCarrierDto): Promise<Carrier> {
    const carrier = await this.findById(tenantId, id);

    if (dto.document && dto.document !== carrier.document) {
      const existing = await this.carrierRepository.findOne({
        where: { tenantId, document: dto.document },
      });

      if (existing) {
        throw new ConflictException('Documento já cadastrado neste tenant');
      }
    }

    Object.assign(carrier, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.document !== undefined && { document: dto.document }),
      ...(dto.email !== undefined && { email: dto.email.toLowerCase() }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.city !== undefined && { city: dto.city }),
      ...(dto.state !== undefined && { state: dto.state.toUpperCase() }),
      ...(dto.active !== undefined && { active: dto.active }),
    });

    const saved = await this.carrierRepository.save(carrier);
    this.logger.log(`Transportadora atualizada: ${saved.id} no tenant ${tenantId}`);

    return saved;
  }

  async remove(tenantId: string, id: string): Promise<{ message: string }> {
    const carrier = await this.findById(tenantId, id);
    await this.carrierRepository.remove(carrier);
    this.logger.log(`Transportadora removida: ${id} no tenant ${tenantId}`);

    return { message: 'Transportadora removida com sucesso' };
  }
}
