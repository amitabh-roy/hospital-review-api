export interface Review {
  id: string;
  hospitalId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
