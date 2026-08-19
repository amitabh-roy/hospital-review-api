import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHospitalDto {
  @ApiProperty({ example: '12345' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  cmsId: string;

  @ApiProperty({ example: 'General Hospital' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @ApiProperty({ example: 'Acute Care' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  facilityType: string;

  @ApiPropertyOptional({ example: 'MANUAL' })
  @IsOptional()
  @IsString()
  @IsIn(['CMS', 'MANUAL'])
  source?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
