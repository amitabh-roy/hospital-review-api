import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ example: 'current-password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'I no longer need this account.' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
