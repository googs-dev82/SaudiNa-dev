import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UploadInitResult {
  bucket: string;
  path: string;
  uploadUrl?: string;
  token?: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly isConfigured: boolean;
  private readonly supabaseUrl?: string;
  private readonly serviceRoleKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.configService
      .get<string>('SUPABASE_URL')
      ?.replace(/\/$/, '');
    this.serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    this.isConfigured = !!(this.supabaseUrl && this.serviceRoleKey);

    if (!this.isConfigured) {
      this.logger.warn('Supabase Storage is not configured properly.');
    }
  }

  private getBucketName(isPublic: boolean): string {
    return isPublic
      ? (this.configService.get<string>('SUPABASE_STORAGE_PUBLIC_BUCKET') ??
          'public-assets')
      : (this.configService.get<string>('SUPABASE_STORAGE_PRIVATE_BUCKET') ??
          'private-assets');
  }

  async createSignedUpload(
    path: string,
    isPublic: boolean,
  ): Promise<UploadInitResult> {
    const bucket = this.getBucketName(isPublic);

    if (!this.isConfigured) {
      this.logger.warn(
        `Storage not configured. Returning logical path for ${path}.`,
      );
      return { bucket, path };
    }

    try {
      const response = await fetch(
        `${this.storageApiUrl}/object/upload/sign/${bucket}/${this.encodePath(path)}`,
        {
          method: 'POST',
          headers: this.storageHeaders(),
          body: JSON.stringify({}),
        },
      );
      const payload = (await response.json().catch(() => null)) as
        | { url?: string; signedUrl?: string; signedURL?: string; token?: string }
        | null;

      if (!response.ok || !payload) {
        throw new Error(
          this.extractStorageError(payload) ??
            `Supabase Storage returned ${response.status}`,
        );
      }

      const relativeUrl = payload.signedUrl ?? payload.signedURL ?? payload.url;
      const uploadUrl = relativeUrl?.startsWith('http')
        ? relativeUrl
        : `${this.storageApiUrl}${relativeUrl ?? ''}`;
      const token = payload.token ?? new URL(uploadUrl).searchParams.get('token') ?? undefined;

      if (!uploadUrl || !token) {
        throw new Error('Supabase Storage did not return a signed upload URL.');
      }

      return {
        bucket,
        path,
        uploadUrl,
        token,
      };
    } catch (err) {
      this.logger.error(
        `Failed to create signed upload URL: ${(err as Error).message}`,
      );
      throw new Error(`Failed to create signed upload URL`);
    }
  }

  async resolveDownloadUrl(path: string, isPublic: boolean): Promise<string> {
    const bucket = this.getBucketName(isPublic);

    if (!this.isConfigured) {
      return `${bucket}/${path}`;
    }

    if (isPublic) {
      return `${this.storageApiUrl}/object/public/${bucket}/${this.encodePath(path)}`;
    }

    try {
      const response = await fetch(
        `${this.storageApiUrl}/object/sign/${bucket}/${this.encodePath(path)}`,
        {
          method: 'POST',
          headers: this.storageHeaders(),
          body: JSON.stringify({ expiresIn: 3600 }),
        },
      );
      const payload = (await response.json().catch(() => null)) as
        | { signedURL?: string; signedUrl?: string }
        | null;

      if (!response.ok || !payload) {
        throw new Error(
          this.extractStorageError(payload) ??
            `Supabase Storage returned ${response.status}`,
        );
      }

      const signedUrl = payload.signedURL ?? payload.signedUrl;
      if (!signedUrl) {
        throw new Error('Supabase Storage did not return a signed URL.');
      }

      return signedUrl.startsWith('http')
        ? signedUrl
        : `${this.storageApiUrl}${signedUrl}`;
    } catch (err) {
      this.logger.error(
        `Failed to create signed download URL: ${(err as Error).message}`,
      );
      throw new Error(`Failed to create signed download URL`);
    }
  }

  private get storageApiUrl(): string {
    return `${this.supabaseUrl}/storage/v1`;
  }

  private storageHeaders(): Record<string, string> {
    return {
      apikey: this.serviceRoleKey as string,
      Authorization: `Bearer ${this.serviceRoleKey}`,
      'Content-Type': 'application/json',
    };
  }

  private encodePath(path: string): string {
    return path
      .split('/')
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join('/');
  }

  private extractStorageError(payload: unknown): string | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const message = (payload as { message?: unknown; error?: unknown }).message;
    const error = (payload as { message?: unknown; error?: unknown }).error;
    return typeof message === 'string'
      ? message
      : typeof error === 'string'
        ? error
        : undefined;
  }
}
