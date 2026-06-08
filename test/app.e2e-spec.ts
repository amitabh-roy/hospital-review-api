import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ApiResponse } from '../src/common/interfaces/api-response.interface';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { HospitalsListResponseDto } from '../src/modules/hospitals/dto/hospitals-list-response.dto';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ?? 'e2e-test-jwt-secret-not-for-production';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as ApiResponse<{ status: string }>;
        expect(body).toMatchObject({
          status: true,
          statusCode: 200,
          errors: [],
          data: { status: 'ok' },
        });
      });
  });

  it('/api/v1/hospitals (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/hospitals')
      .expect(200)
      .expect((res) => {
        const body = res.body as ApiResponse<HospitalsListResponseDto>;
        expect(body.status).toBe(true);
        expect(Array.isArray(body.data?.items)).toBe(true);
        expect(body.data?.items.length).toBeGreaterThan(0);
        expect(body.data?.pagination).toBeDefined();
        expect(typeof body.data?.pagination.page).toBe('number');
        expect(typeof body.data?.pagination.limit).toBe('number');
        expect(typeof body.data?.pagination.total).toBe('number');
        expect(typeof body.data?.pagination.totalPages).toBe('number');
      });
  });
});
