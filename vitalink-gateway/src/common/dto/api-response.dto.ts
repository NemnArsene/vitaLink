import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  perPage: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}

export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  data: T;

  @ApiProperty({ required: false })
  meta?: PaginationMetaDto;

  static ok<T>(data: T, message = 'Operation completed successfully'): ApiResponseDto<T> {
    return { success: true, message, data };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    perPage: number,
    message = 'Operation completed successfully',
  ): ApiResponseDto<T[]> {
    return {
      success: true,
      message,
      data,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        hasNext: page * perPage < total,
        hasPrev: page > 1,
      },
    };
  }
}
