import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '@/modules/auth/interfaces/auth.interface';
import { ListSimulationsQueryDto } from './dto/list-simulations-query.dto';
import { SimulateFreightDto } from './dto/simulate-freight.dto';
import { FreightService } from './services/freight.service';

@Controller('freight')
export class FreightController {
  constructor(private readonly freightService: FreightService) {}

  @Post('simulate')
  @HttpCode(HttpStatus.ACCEPTED)
  simulate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SimulateFreightDto,
  ) {
    return this.freightService.createSimulation(user.tenantId, user.id, dto);
  }

  @Get('simulations')
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListSimulationsQueryDto,
  ) {
    return this.freightService.findAll(user.tenantId, query);
  }

  @Get('simulations/:id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.freightService.findById(user.tenantId, id);
  }
}
