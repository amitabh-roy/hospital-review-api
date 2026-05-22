import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { API_RESPONSE } from '../common/constants/api-response.constants';
import type { ControllerResponse } from '../common/interfaces/controller-response.interface';

/** Liveness probe for load balancers and deployment checks. */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  /** GET /api/v1/health */
  @Get()
  @ApiOperation({ summary: 'Health check' })
  check(): ControllerResponse<{ status: string }> {
    return {
      message: API_RESPONSE.DEFAULT_SUCCESS,
      data: { status: 'ok' },
    };
  }
}
