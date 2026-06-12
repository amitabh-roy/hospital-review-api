export class ContactSubmissionResponseDto {
  id!: number;
  firstName!: string;
  lastName!: string;
  email!: string;
  topic!: string | null;
  message!: string;
  isRead!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
