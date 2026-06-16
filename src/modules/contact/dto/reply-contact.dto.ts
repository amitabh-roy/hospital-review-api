import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReplyContactDto {
  @ApiProperty({ example: 'Thanks for reaching out. Here is our response...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  reply: string;
}
