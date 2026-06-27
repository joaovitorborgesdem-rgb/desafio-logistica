import { Controller, Get, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Request() req: any) {
    const tenantId = req.user?.tenant_id ?? 'default';
    return this.dashboardService.getSummary(tenantId);
  }

  @Get('insights')
  getInsights(@Request() req: any) {
    const tenantId = req.user?.tenant_id ?? 'default';
    return this.dashboardService.getInsights(tenantId);
  }
}
