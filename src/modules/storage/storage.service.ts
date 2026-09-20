import { getSupabaseAdminClient } from '../../config/supabase.config';

export type StorageBucket = 'branding' | 'menu' | 'catering' | 'documents' | 'invoices' | 'uploads';

export interface StorageUploadOptions {
  bucket: StorageBucket;
  path: string;
  fileBuffer: Buffer;
  contentType: string;
  isPublic?: boolean;
}

export class StorageService {
  /**
   * Allowed MIME types for business uploads
   */
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf'
  ];

  /**
   * Maximum allowed file size (5 MB)
   */
  private static readonly MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

  /**
   * Validate uploaded media file buffer
   */
  public static validateFile(fileBuffer: Buffer, contentType: string): { valid: boolean; error?: string } {
    if (!this.ALLOWED_MIME_TYPES.includes(contentType)) {
      return {
        valid: false,
        error: `Unsupported content type: ${contentType}. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`
      };
    }

    if (fileBuffer.length > this.MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `File size exceeds 5MB limit (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB)`
      };
    }

    return { valid: true };
  }

  /**
   * Upload media to Supabase Storage and return storage path for PostgreSQL reference.
   * Never stores image binaries in PostgreSQL.
   */
  public static async uploadMedia(options: StorageUploadOptions): Promise<string | null> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return null;
    }

    const validation = this.validateFile(options.fileBuffer, options.contentType);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const { data, error } = await admin.storage
      .from(options.bucket)
      .upload(options.path, options.fileBuffer, {
        contentType: options.contentType,
        upsert: true
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Return the clean relative storage path to be saved in DB
    return data.path;
  }
}
