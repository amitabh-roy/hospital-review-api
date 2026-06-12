import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AdminReviewFeedbackDto {
  @ApiProperty({
    example: 'Please remove the individual name mentioned in paragraph two.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  feedback: string;
}
