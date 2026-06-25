import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

@Injectable()
export class AzureStorageService implements OnModuleInit {
  private readonly logger = new Logger(AzureStorageService.name);
  private containerClient: ContainerClient | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const connStr = this.config.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    const container = this.config.get<string>('AZURE_STORAGE_CONTAINER_NAME', 'lab-assets');

    if (!connStr) {
      this.logger.warn('AZURE_STORAGE_CONNECTION_STRING not set — file uploads will fail');
      return;
    }

    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
      this.containerClient = blobServiceClient.getContainerClient(container);
      this.logger.log(`Azure Blob Storage connected → container: ${container}`);
    } catch (err) {
      this.logger.error('Failed to init Azure Blob Storage', err);
    }
  }

  /**
   * Upload a base64 data URI (e.g. "data:image/png;base64,...") to Azure.
   * Returns the public blob URL.
   * @param base64DataUri  Full data URI from the frontend
   * @param folder         Subfolder inside the container (e.g. "signatures", "logos")
   * @param safeName       Sanitised display name used as part of the blob name
   */
  async uploadBase64(base64DataUri: string, folder: string, safeName: string): Promise<string> {
    if (!this.containerClient) {
      throw new Error('Azure Blob Storage is not configured (AZURE_STORAGE_CONNECTION_STRING missing)');
    }

    const matches = base64DataUri.match(/^data:([A-Za-z-+/]+);base64,(.+)$/s);
    if (!matches) throw new Error('Invalid base64 data URI');

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    // Derive extension from MIME type (image/png → png, application/pdf → pdf)
    const ext = mimeType.split('/')[1]?.replace('+', '') ?? 'bin';
    const slug = safeName.replace(/[^a-zA-Z0-9_-]/g, '-').substring(0, 60);
    const blobName = `${folder}/${Date.now()}-${slug}.${ext}`;

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    return blockBlobClient.url;
  }

  /** Delete a blob by its full URL. Fails silently if the blob doesn't exist. */
  async deleteByUrl(url: string): Promise<void> {
    if (!this.containerClient || !url) return;
    try {
      // Extract blob name: everything after /<container>/
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/');
      // Pathname is /<container>/<folder>/... — drop the empty first element and container name
      const blobName = parts.slice(2).join('/');
      if (!blobName) return;
      await this.containerClient.getBlockBlobClient(blobName).deleteIfExists();
    } catch (err) {
      this.logger.warn(`Failed to delete blob at ${url}: ${String(err)}`);
    }
  }
}
