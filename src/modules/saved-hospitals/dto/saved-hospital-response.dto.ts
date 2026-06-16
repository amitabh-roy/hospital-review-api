export class SavedHospitalResponseDto {
  id!: number;
  hospitalId!: number;
  slug!: string;
  hospitalName!: string;
  city!: string;
  state!: string;
  facilityType!: string;
  averageRating!: number;
  approvedReviewCount!: number;
  savedAt!: Date;
}
