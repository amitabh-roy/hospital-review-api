import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { Readable } from 'stream';

export interface S3UploadOptions {
  folder: string;
  namePrefix?: string;
}

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly keyPrefix: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>(
      's3.bucket',
      'opencurtain-dev',
    );
    this.keyPrefix = this.configService.get<string>('s3.keyPrefix', '');
    this.region = this.configService.get<string>('s3.region', 'us-east-1');
    this.client = new S3Client({
      region: this.region,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    options: S3UploadOptions,
  ): Promise<string> {
    const key = this.buildObjectKey(file, options);
    const contentType = file.mimetype || this.guessMimeTypeFromKey(key);
    const url = this.getObjectUrl(key);

    this.logger.log(
      `S3 upload started: originalName=${file.originalname}, size=${file.size}, contentType=${contentType}, bucket=${this.bucket}, key=${key}`,
    );

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: contentType,
        }),
      );

      this.logger.log(
        `S3 upload successful: bucket=${this.bucket}, key=${key}, url=${url}`,
      );

      return key;
    } catch (error) {
      this.logger.error(
        `S3 upload failed: bucket=${this.bucket}, key=${key}, originalName=${file.originalname}, error=${error}`,
      );
      throw error;
    }
  }

  async readFile(key: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    const buffer = await this.streamToBuffer(response.Body);
    const mimeType = response.ContentType ?? this.guessMimeTypeFromKey(key);

    return { buffer, mimeType };
  }

  async deleteFile(key: string | null | undefined): Promise<void> {
    if (!key) {
      return;
    }

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.warn(`Failed to delete S3 object ${key}: ${error}`);
    }
  }

  async deleteFiles(keys: Array<string | null | undefined>): Promise<void> {
    await Promise.all(keys.map((key) => this.deleteFile(key)));
  }

  getObjectUrl(key: string): string {
    const encodedKey = key
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${encodedKey}`;
  }

  private buildObjectKey(
    file: Express.Multer.File,
    options: S3UploadOptions,
  ): string {
    const folder = options.folder.replace(/^\/+|\/+$/g, '');
    const extension = path.extname(file.originalname) || '.bin';
    const filename = `${options.namePrefix ?? 'file'}-${randomUUID()}${extension}`;
    const segments = [this.keyPrefix, folder, filename].filter(Boolean);

    return segments.join('/');
  }

  private guessMimeTypeFromKey(key: string): string {
    const lower = key.toLowerCase();

    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.heic')) return 'image/heic';
    if (lower.endsWith('.pdf')) return 'application/pdf';

    return 'image/jpeg';
  }

  private async streamToBuffer(body: unknown): Promise<Buffer> {
    if (!body) {
      throw new Error('S3 object body is empty');
    }

    if (Buffer.isBuffer(body)) {
      return body;
    }

    if (body instanceof Uint8Array) {
      return Buffer.from(body);
    }

    if (body instanceof Readable) {
      const chunks: Buffer[] = [];

      for await (const chunk of body) {
        chunks.push(this.toBuffer(chunk));
      }

      return Buffer.concat(chunks);
    }

    if (
      typeof body === 'object' &&
      body !== null &&
      'transformToByteArray' in body &&
      typeof (body as { transformToByteArray: () => Promise<Uint8Array> })
        .transformToByteArray === 'function'
    ) {
      const bytes = await (
        body as { transformToByteArray: () => Promise<Uint8Array> }
      ).transformToByteArray();

      return Buffer.from(bytes);
    }

    throw new Error('Unsupported S3 object body type');
  }

  private toBuffer(chunk: unknown): Buffer {
    if (Buffer.isBuffer(chunk)) {
      return chunk;
    }

    if (chunk instanceof Uint8Array) {
      return Buffer.from(chunk);
    }

    if (typeof chunk === 'string') {
      return Buffer.from(chunk);
    }

    throw new Error('Unsupported stream chunk type');
  }
}
