import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoginSwagger, MeSwagger, SignupSwagger } from './docs/users.swagger';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { UsersService } from './users.service';

@ApiTags('Auth')
@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @SignupSwagger()
  signup(@Body() dto: SignupDto) {
    return this.usersService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginSwagger()
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @MeSwagger()
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMe(user);
  }
}
