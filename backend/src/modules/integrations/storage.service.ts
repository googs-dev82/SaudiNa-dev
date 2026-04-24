import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadInitResult {
  bucket: string;
  path: string;
  uploadUrl?: string;
  token?: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client?: S3Client;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('SUPABASE_URL');
    const accessKeyId = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY') || accessKeyId; // Fallback for backward compatibility

    this.isConfigured = !!(endpoint && accessKeyId && secretAccessKey);

    if (this.isConfigured) {
      this.s3Client = new S3Client({
        region: 'us-east-1', // MinIO defaults to us-east-1
        endpoint,
        forcePathStyle: true, // Necessary for MinIO and other S3 compatible stores
        credentials: {
          accessKeyId: accessKeyId as string,
          secretAccessKey: secretAccessKey as string,
        },
      });
    } else {
      this.logger.warn('S3/MinIO storage not configured properly.');
    }
  }

  private getBucketName(isPublic: boolean): string {
    return isPublic
      ? (this.configService.get<string>('SUPABASE_STORAGE_PUBLIC_BUCKET') ?? 'public-assets')
      : (this.configService.get<string>('SUPABASE_STORAGE_PRIVATE_BUCKET') ?? 'private-assets');
  }

  async createSignedUpload(
    path: string,
    isPublic: boolean,
  ): Promise<UploadInitResult> {
    const bucket = this.getBucketName(isPublic);

    if (!this.isConfigured) {
      this.logger.warn(`Storage not configured. Returning logical path for ${path}.`);
      return { bucket, path };
    }

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        ContentType: "application/octet-stream",
      });

      // Generate a pre-signed URL for upload valid for 1 hour
      const uploadUrl = await getSignedUrl(this.s3Client!, command, { expiresIn: 3600 });

      return {
        bucket,
        path,
        uploadUrl,
      };
    } catch (err) {
      this.logger.error(`Failed to create signed upload URL: ${(err as Error).message}`);
      throw new Error(`Failed to create signed upload URL`);
    }
  }

  async resolveDownloadUrl(path: string, isPublic: boolean): Promise<string> {
    const endpoint = this.configService.get<string>('SUPABASE_URL');
    const bucket = this.getBucketName(isPublic);

    if (!this.isConfigured || !endpoint) {
      return `${bucket}/${path}`;
    }

    if (isPublic) {
      // For MinIO with forcePathStyle, the public URL is endpoint/bucket/key
      return `${endpoint}/${bucket}/${path}`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: path,
      });

      // Generate a pre-signed URL for download valid for 1 hour
      const downloadUrl = await getSignedUrl(this.s3Client!, command, { expiresIn: 3600 });
      return downloadUrl;
    } catch (err) {
      this.logger.error(`Failed to create signed download URL: ${(err as Error).message}`);
      throw new Error(`Failed to create signed download URL`);
    }
  }
}
