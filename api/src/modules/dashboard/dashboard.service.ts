import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreightSimulation } from '../freight/entities/freight-simulation.entity';
import { FreightSimulationStatus } from '../freight/enums/freight-simulation-status.enum';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(FreightSimulation)
    private readonly simulationRepo: Repository<FreightSimulation>,
  ) {}

  async getSummary(tenantId: string) {
    this.logger.log(`Buscando summary para tenant ${tenantId}`);

    const total = await this.simulationRepo.count({
      where: { tenantId, status: FreightSimulationStatus.DONE },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonth = await this.simulationRepo
      .createQueryBuilder('s')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.status = :status', { status: FreightSimulationStatus.DONE })
      .andWhere('s.createdAt >= :start', { start: startOfMonth })
      .getCount();

    const avgResult = await this.simulationRepo
      .createQueryBuilder('s')
      .select('AVG(s.cargoValue)', 'avg')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.status = :status', { status: FreightSimulationStatus.DONE })
      .getRawOne();

    const avgFreightValue = parseFloat(avgResult?.avg ?? '0');

    const topOriginsRaw = await this.simulationRepo
      .createQueryBuilder('s')
      .select('s.originCep', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.status = :status', { status: FreightSimulationStatus.DONE })
      .groupBy('s.originCep')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const topDestinationsRaw = await this.simulationRepo
      .createQueryBuilder('s')
      .select('s.destinationCep', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.status = :status', { status: FreightSimulationStatus.DONE })
      .groupBy('s.destinationCep')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const byDayRaw = await this.simulationRepo
      .createQueryBuilder('s')
      .select('DATE(s.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.createdAt >= :start', { start: thirtyDaysAgo })
      .groupBy('DATE(s.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      total_simulations: total,
      simulations_this_month: thisMonth,
      avg_freight_value: avgFreightValue,
      most_used_carrier: 'Econômica',
      top_origins: topOriginsRaw.map((r) => ({ city: r.city, count: parseInt(r.count) })),
      top_destinations: topDestinationsRaw.map((r) => ({ city: r.city, count: parseInt(r.count) })),
      simulations_by_day: byDayRaw.map((r) => ({ date: r.date, count: parseInt(r.count) })),
    };
  }

  async getInsights(tenantId: string) {
    const insights: { type: string; title: string; description: string; severity: string }[] = [];

    const total = await this.simulationRepo.count({
      where: { tenantId, status: FreightSimulationStatus.DONE },
    });

    if (total === 0) {
      insights.push({
        type: 'empty',
        title: 'Nenhuma simulação realizada ainda',
        description: 'Realize sua primeira simulação de frete para ver insights.',
        severity: 'info',
      });
      return insights;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const avgThisMonth = await this.simulationRepo
      .createQueryBuilder('s')
      .select('AVG(s.cargoValue)', 'avg')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.status = :status', { status: FreightSimulationStatus.DONE })
      .andWhere('s.createdAt >= :start', { start: startOfMonth })
      .getRawOne();

    const avgLastMonth = await this.simulationRepo
      .createQueryBuilder('s')
      .select('AVG(s.cargoValue)', 'avg')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.status = :status', { status: FreightSimulationStatus.DONE })
      .andWhere('s.createdAt >= :start', { start: startOfLastMonth })
      .andWhere('s.createdAt <= :end', { end: endOfLastMonth })
      .getRawOne();

    const avgNow = parseFloat(avgThisMonth?.avg ?? '0');
    const avgPrev = parseFloat(avgLastMonth?.avg ?? '0');

    if (avgPrev > 0 && avgNow > avgPrev * 1.2) {
      insights.push({
        type: 'cost_increase',
        title: 'Custo médio de frete em alta',
        description: 'O valor médio de carga aumentou mais de 20% em relação ao mês anterior.',
        severity: 'warning',
      });
    }

    const topDest = await this.simulationRepo
      .createQueryBuilder('s')
      .select('s.destinationCep', 'dest')
      .addSelect('COUNT(*)', 'count')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.status = :status', { status: FreightSimulationStatus.DONE })
      .groupBy('s.destinationCep')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    if (topDest && parseInt(topDest.count) / total > 0.4) {
      insights.push({
        type: 'concentration',
        title: 'Alta concentração de destino',
        description: `O CEP ${topDest.dest} representa mais de 40% das simulações.`,
        severity: 'warning',
      });
    }

    const thisMonthCount = await this.simulationRepo
      .createQueryBuilder('s')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.status = :status', { status: FreightSimulationStatus.DONE })
      .andWhere('s.createdAt >= :start', { start: startOfMonth })
      .getCount();

    if (thisMonthCount > total * 0.5) {
      insights.push({
        type: 'high_volume',
        title: 'Alto volume de simulações este mês',
        description: 'Mais de 50% de todas as simulações foram feitas neste mês.',
        severity: 'info',
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'normal',
        title: 'Operação dentro do normal',
        description: 'Nenhuma anomalia detectada nos dados atuais.',
        severity: 'info',
      });
    }

    return insights;
  }
}
