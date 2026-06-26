import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepository.findOne({
      where: { slug: dto.slug.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Slug já cadastrado');
    }

    const tenant = this.tenantRepository.create({
      name: dto.name,
      slug: dto.slug.toLowerCase(),
      active: dto.active ?? true,
    });

    const saved = await this.tenantRepository.save(tenant);
    this.logger.log(`Tenant criado: ${saved.id} (${saved.slug})`);

    return saved;
  }

  async findById(id: string, requesterTenantId?: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    if (requesterTenantId && tenant.id !== requesterTenantId) {
      throw new ForbiddenException('Acesso negado a este tenant');
    }

    return tenant;
  }

  async update(
    id: string,
    dto: UpdateTenantDto,
    requesterTenantId?: string,
  ): Promise<Tenant> {
    const tenant = await this.findById(id, requesterTenantId);

    if (dto.slug && dto.slug.toLowerCase() !== tenant.slug) {
      const existing = await this.tenantRepository.findOne({
        where: { slug: dto.slug.toLowerCase() },
      });

      if (existing) {
        throw new ConflictException('Slug já cadastrado');
      }
    }

    Object.assign(tenant, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.slug !== undefined && { slug: dto.slug.toLowerCase() }),
      ...(dto.active !== undefined && { active: dto.active }),
    });

    const saved = await this.tenantRepository.save(tenant);
    this.logger.log(`Tenant atualizado: ${saved.id}`);

    return saved;
  }
}
