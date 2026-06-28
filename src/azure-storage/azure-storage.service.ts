import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class AzureStorageService implements OnModuleInit {
  private readonly logger = new Logger(AzureStorageService.name);
  private configured = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn('Cloudinary credentials not set — file uploads will fail');
      return;
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    this.configured = true;
    this.logger.log(`Cloudinary configured → cloud: ${cloudName}`);
  }

  async uploadBase64(base64DataUri: string, folder: string, safeName: string): Promise<string> {
    if (!this.configured) {
      throw new Error('Cloudinary is not configured (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET missing)');
    }

    const slug = safeName.replace(/[^a-zA-Z0-9_-]/g, '-').substring(0, 60);
    const publicId = `${folder}/${Date.now()}-${slug}`;

    const result = await cloudinary.uploader.upload(base64DataUri, {
      public_id: publicId,
      resource_type: 'auto',
      overwrite: false,
    });

    return result.secure_url;
  }

  async deleteByUrl(url: string): Promise<void> {
    if (!this.configured || !url) return;
    try {
      // Cloudinary URL: https://res.cloudinary.com/{cloud}/{type}/upload/v{ver}/{folder}/{name}.{ext}
      const uploadIndex = url.indexOf('/upload/');
      if (uploadIndex === -1) return;
      const afterUpload = url.substring(uploadIndex + 8); // "v1234/folder/name.ext"
      const withoutVersion = afterUpload.replace(/^v\d+\//, ''); // "folder/name.ext"
      const publicId = withoutVersion.replace(/\.[^.]+$/, ''); // "folder/name"
      if (!publicId) return;
      await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
    } catch (err) {
      this.logger.warn(`Failed to delete Cloudinary asset at ${url}: ${String(err)}`);
    }
  }
}
