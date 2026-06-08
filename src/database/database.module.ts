import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { getDatabaseDialectOptions } from './database-ssl';
import { databaseModels } from './database.providers';

@Global()
@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadModels: false,
        synchronize: false,
        logging: configService.get<boolean>('database.logging', false),
        models: [...databaseModels],
        define: {
          underscored: true,
        },
        ...getDatabaseDialectOptions(),
      }),
    }),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
