import { ApiProperty } from '@nestjs/swagger';

export class RoleOptionDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'Registered Nurse (RN)' })
  name: string;
}
