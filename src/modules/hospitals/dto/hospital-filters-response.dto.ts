import { ApiProperty } from '@nestjs/swagger';

export class HospitalFiltersResponseDto {
  @ApiProperty({ example: ['Illinois', 'Massachusetts', 'New York'] })
  states!: string[];

  @ApiProperty({
    example: ['General Acute Care', 'Specialty Hospital', 'Teaching Hospital'],
  })
  facilityTypes!: string[];
}
