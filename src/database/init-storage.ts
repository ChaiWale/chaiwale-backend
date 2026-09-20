import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

interface BucketDefinition {
  name: string;
  isPublic: boolean;
  fileSizeLimit?: number; // bytes
  allowedMimeTypes?: string[];
}

const BUCKET_DEFINITIONS: BucketDefinition[] = [
  {
    name: 'branding',
    isPublic: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  },
  {
    name: 'menu',
    isPublic: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  {
    name: 'catering',
    isPublic: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  {
    name: 'documents',
    isPublic: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  {
    name: 'invoices',
    isPublic: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['application/pdf']
  },
  {
    name: 'uploads',
    isPublic: false,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  }
];

export async function initStorageBuckets(): Promise<{ created: string[]; existing: string[] }> {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to initialize storage buckets');
  }

  const client = createClient(url, serviceKey, {
    auth: { persistSession: false }
  });

  console.log('[STORAGE] Fetching existing Supabase Storage buckets...');
  const { data: existingBuckets, error: listError } = await client.storage.listBuckets();
  if (listError) {
    throw new Error(`Failed to list buckets: ${listError.message}`);
  }

  const existingNames = (existingBuckets || []).map((b) => b.name);
  console.log(`[STORAGE] Currently existing buckets: ${existingNames.join(', ') || 'None'}`);

  const created: string[] = [];
  const existing: string[] = [];

  for (const def of BUCKET_DEFINITIONS) {
    if (existingNames.includes(def.name)) {
      console.log(`[STORAGE] Bucket "${def.name}" already exists.`);
      existing.push(def.name);
    } else {
      console.log(`[STORAGE] Creating bucket "${def.name}" (public: ${def.isPublic})...`);
      const { data, error } = await client.storage.createBucket(def.name, {
        public: def.isPublic,
        fileSizeLimit: def.fileSizeLimit,
        allowedMimeTypes: def.allowedMimeTypes
      });

      if (error) {
        throw new Error(`Failed to create bucket "${def.name}": ${error.message}`);
      }

      console.log(`[STORAGE] Successfully created bucket "${def.name}".`);
      created.push(def.name);
    }
  }

  return { created, existing };
}

if (require.main === module) {
  initStorageBuckets()
    .then((res) => {
      console.log(`\n[STORAGE] Storage bucket initialization complete.`);
      console.log(`[STORAGE] Created: ${res.created.join(', ') || 'None'}`);
      console.log(`[STORAGE] Existing: ${res.existing.join(', ') || 'None'}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[STORAGE] Storage initialization failed:', err.message);
      process.exit(1);
    });
}
