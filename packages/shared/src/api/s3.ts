import type { AxiosInstance } from 'axios';
import { unwrapApiResponse, type ApiResponse } from './client';
import type { S3PresignedUrlRequest, S3PresignedUrlResponse } from '../types';

export function createS3Api(apiClient: AxiosInstance) {
  return {
    createPresignedUrl: (payload: S3PresignedUrlRequest): Promise<S3PresignedUrlResponse> =>
      apiClient
        .post<ApiResponse<S3PresignedUrlResponse>>('/s3/presigned-url', payload)
        .then((response) => unwrapApiResponse(response.data)),
  };
}

export type S3Api = ReturnType<typeof createS3Api>;
