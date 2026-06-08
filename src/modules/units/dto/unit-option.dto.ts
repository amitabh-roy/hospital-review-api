import { ApiProperty } from '@nestjs/swagger';

export class UnitOptionDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'ICU' })
  name: string;
}
