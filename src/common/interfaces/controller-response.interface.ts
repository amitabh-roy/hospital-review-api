/** Shape returned by controllers/services before the global response interceptor wraps it. */
export interface ControllerResponse<T> {
  message: string;
  data: T;
}
