import { ApiProperty } from '@nestjs/swagger';

export class UnitResponseDto {
  @ApiProperty({ example: 1, description: 'Reusable unit definition ID' })
  id: number;

  @ApiProperty({ example: 'ICU' })
  name: string;
}
