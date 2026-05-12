import type { AxiosInstance } from 'axios';
import { unwrapApiResponse, type ApiResponse } from './client';
import type {
  S3PresignedUrlRequest,
  S3PresignedUrlResponse,
  S3UploadImageResult,
} from '../types';

async function putFileToS3(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed with status ${response.status}`);
  }
}

export function createS3Api(apiClient: AxiosInstance) {
  const createPresignedUrl = (payload: S3PresignedUrlRequest): Promise<S3PresignedUrlResponse> =>
    apiClient
      .post<ApiResponse<S3PresignedUrlResponse>>('/s3/presigned-url', payload)
      .then((response) => unwrapApiResponse(response.data));

  return {
    createPresignedUrl,

    uploadImage: async (file: File): Promise<S3UploadImageResult> => {
      const presignedUrl = await createPresignedUrl({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      await putFileToS3(presignedUrl.uploadUrl, file);

      return {
        objectKey: presignedUrl.objectKey,
      };
    },
  };
}

export type S3Api = ReturnType<typeof createS3Api>;
