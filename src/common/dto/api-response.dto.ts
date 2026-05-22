import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Request successful' })
  message: string;

  @ApiProperty({ example: [], type: [String] })
  errors: string[];

  @ApiProperty({ nullable: true })
  data: unknown;
}
