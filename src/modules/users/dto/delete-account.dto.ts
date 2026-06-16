import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ example: 'current-password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'I no longer work in healthcare and do not need this account.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  reason: string;
}
