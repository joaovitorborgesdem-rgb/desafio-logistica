import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('clients')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/tmp/uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['.csv', '.xlsx'];
        if (!allowed.includes(extname(file.originalname).toLowerCase())) {
          return cb(new BadRequestException('Apenas arquivos CSV ou XLSX são permitidos'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadClients(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) throw new BadRequestException('Arquivo não enviado');
    const tenantId = req.user?.tenant_id ?? 'default';
    return this.uploadService.processFile(file, 'clients', tenantId);
  }

  @Post('carriers')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/tmp/uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['.csv', '.xlsx'];
        if (!allowed.includes(extname(file.originalname).toLowerCase())) {
          return cb(new BadRequestException('Apenas arquivos CSV ou XLSX são permitidos'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadCarriers(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) throw new BadRequestException('Arquivo não enviado');
    const tenantId = req.user?.tenant_id ?? 'default';
    return this.uploadService.processFile(file, 'carriers', tenantId);
  }
}
