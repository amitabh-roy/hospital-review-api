import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactDto } from './dto/reply-contact.dto';

@ApiTags('Contact')
@Controller()
@UseGuards(ThrottlerGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('contact')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @Get('admin/contact-submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listAll() {
    return this.contactService.listAll();
  }

  @Patch('admin/contact-submissions/:id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  markRead(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.markRead(id);
  }

  @Post('admin/contact-submissions/:id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplyContactDto,
  ) {
    return this.contactService.reply(id, dto);
  }
}
