import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../clients/entities/client.entity';
import { Carrier } from '../carriers/entities/carrier.entity';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Carrier])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
