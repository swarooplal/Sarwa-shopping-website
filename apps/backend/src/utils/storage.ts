import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { config } from '../config';

export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export async function saveLocal(file: Express.Multer.File): Promise<UploadedFile> {
  const dir = path.resolve(process.cwd(), config.uploadDir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const ext = path.extname(file.originalname) || '.bin';
  const filename = `${uuid()}${ext}`;
  const dest = path.join(dir, filename);

  await fs.promises.writeFile(dest, file.buffer);

  return {
    url: `${config.publicUrl}/${config.uploadDir}/${filename}`,
    filename,
    size: file.size,
    mimeType: file.mimetype,
  };
}

// S3 placeholder. Replace with real AWS S3 SDK in production.
export async function uploadToS3(_file: Express.Multer.File): Promise<UploadedFile> {
  if (!config.aws.bucket) {
    throw new Error('S3 bucket not configured.');
  }
  // Implementation left to ops; use @aws-sdk/client-s3 in production.
  throw new Error('S3 upload not implemented. Configure AWS SDK in production.');
}
