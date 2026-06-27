import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { readFileSync } from 'fs';
import { extname } from 'path';
import * as xlsx from 'xlsx';
import { parse } from 'csv-parse/sync';
import { Client } from '../clients/entities/client.entity';
import { Carrier } from '../carriers/entities/carrier.entity';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(Carrier)
    private readonly carrierRepo: Repository<Carrier>,
  ) {}

  async processFile(file: Express.Multer.File, type: 'clients' | 'carriers', tenantId: string) {
    this.logger.log(`Processando arquivo ${file.originalname} para tenant ${tenantId}`);

    const rows = this.parseFile(file);
    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (type === 'clients') {
          await this.importClient(row, tenantId);
        } else {
          await this.importCarrier(row, tenantId);
        }
        imported++;
      } catch (err: any) {
        errors.push(`Linha ${i + 2}: ${err.message}`);
      }
    }

    return {
      total: rows.length,
      imported,
      failed: rows.length - imported,
      errors,
    };
  }

  private parseFile(file: Express.Multer.File): Record<string, any>[] {
    const ext = extname(file.originalname).toLowerCase();
    const buffer = readFileSync(file.path);

    if (ext === '.csv') {
      return parse(buffer, { columns: true, skip_empty_lines: true, trim: true });
    }

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_json(sheet);
  }

  private async importClient(row: Record<string, any>, tenantId: string) {
    if (!row.name || !row.email) throw new Error('Campos name e email são obrigatórios');
    const client = this.clientRepo.create({
      tenantId,
      name: row.name,
      email: row.email,
      phone: row.phone ?? null,
      document: row.document ?? null,
      city: row.city ?? null,
      state: row.state ?? null,
    });
    await this.clientRepo.save(client);
  }

  private async importCarrier(row: Record<string, any>, tenantId: string) {
    if (!row.name) throw new Error('Campo name é obrigatório');
    const carrier = this.carrierRepo.create({
      tenantId,
      name: row.name,
      document: row.document ?? null,
      email: row.email ?? null,
      phone: row.phone ?? null,
      city: row.city ?? null,
      state: row.state ?? null,
      active: true,
    });
    await this.carrierRepo.save(carrier);
  }
}
