export class ApiResponseDto<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;

  constructor(success: boolean, message: string, data: T) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static ok<T>(data: T, message = 'Success'): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data);
  }

  static error<T>(message: string, data: T = null as any): ApiResponseDto<T> {
    return new ApiResponseDto(false, message, data);
  }
}
