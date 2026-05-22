export interface ApiResponse<T = unknown> {
  status: boolean;
  statusCode: number;
  message: string;
  errors: string[];
  data: T | null;
}
