export class ContactSubmissionResponseDto {
  id!: number;
  firstName!: string;
  lastName!: string;
  email!: string;
  topic!: string | null;
  message!: string;
  isRead!: boolean;
  adminReply!: string | null;
  repliedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
