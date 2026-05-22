import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ApiResponse } from '../src/common/interfaces/api-response.interface';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { Hospital } from '../src/modules/hospitals/interfaces/hospital.interface';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

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
        const body = res.body as ApiResponse<Hospital[]>;
        expect(body.status).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data?.length).toBeGreaterThan(0);
      });
  });
});
