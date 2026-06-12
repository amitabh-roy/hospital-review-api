import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { handleDatabaseException } from '../../common/utils/database-exception.util';
import { ContactSubmissionModel } from '../../database/models/contact-submission.model';
import { CONTACT_RESPONSE } from './constants/contact.response';
import { ContactSubmissionResponseDto } from './dto/contact-submission-response.dto';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactSubmissionModel)
    private readonly contactModel: typeof ContactSubmissionModel,
  ) {}

  async create(
    dto: CreateContactDto,
  ): Promise<ControllerResponse<ContactSubmissionResponseDto>> {
    try {
      const submission = await this.contactModel.create({
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.trim().toLowerCase(),
        topic: dto.topic?.trim() || null,
        message: dto.message.trim(),
      });

      return {
        message: CONTACT_RESPONSE.SUBMITTED,
        data: this.toResponse(submission),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: ContactService.name,
        operation: 'contact submission',
      });
    }
  }

  async listAll(): Promise<
    ControllerResponse<{ items: ContactSubmissionResponseDto[] }>
  > {
    try {
      const items = await this.contactModel.findAll({
        order: [['createdAt', 'DESC']],
      });

      return {
        message: CONTACT_RESPONSE.FETCHED,
        data: {
          items: items.map((item) => this.toResponse(item)),
        },
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: ContactService.name,
        operation: 'list contact submissions',
      });
    }
  }

  async markRead(
    id: number,
  ): Promise<ControllerResponse<ContactSubmissionResponseDto>> {
    try {
      const submission = await this.contactModel.findByPk(id);

      if (!submission) {
        throw new NotFoundException(CONTACT_RESPONSE.NOT_FOUND);
      }

      await submission.update({ isRead: true });

      return {
        message: CONTACT_RESPONSE.UPDATED,
        data: this.toResponse(submission),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: ContactService.name,
        operation: 'mark contact submission read',
      });
    }
  }

  private toResponse(
    submission: ContactSubmissionModel,
  ): ContactSubmissionResponseDto {
    return {
      id: submission.id,
      firstName: submission.firstName,
      lastName: submission.lastName,
      email: submission.email,
      topic: submission.topic,
      message: submission.message,
      isRead: submission.isRead,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    };
  }
}
