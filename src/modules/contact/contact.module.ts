import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ContactSubmissionModel } from '../../database/models/contact-submission.model';
import { UsersModule } from '../users/users.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [
    UsersModule,
    SequelizeModule.forFeature([ContactSubmissionModel]),
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
