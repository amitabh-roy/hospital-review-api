import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TempFileStorageService {
  private readonly logger = new Logger(TempFileStorageService.name);
  private readonly tempDir: string;

  constructor(private readonly configService: ConfigService) {
    this.tempDir = this.configService.get<string>(
      'upload.tempDir',
      path.join(process.cwd(), 'uploads', 'temp'),
    );
  }

  async ensureTempDir(): Promise<void> {
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  async saveUploadedFile(
    file: Express.Multer.File,
    prefix: string,
  ): Promise<string> {
    await this.ensureTempDir();

    const extension = path.extname(file.originalname) || '.bin';
    const filename = `${prefix}-${randomUUID()}${extension}`;
    const absolutePath = path.join(this.tempDir, filename);

    await fs.writeFile(absolutePath, file.buffer);

    return absolutePath;
  }

  async deleteFileIfExists(filePath: string | null | undefined): Promise<void> {
    if (!filePath) {
      return;
    }

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`Failed to delete temp file ${filePath}: ${error}`);
      }
    }
  }

  async deleteFiles(
    filePaths: Array<string | null | undefined>,
  ): Promise<void> {
    await Promise.all(filePaths.map((filePath) => this.deleteFileIfExists(filePath)));
  }

  resolveAbsolutePath(filePath: string): string {
    return path.isAbsolute(filePath)
      ? filePath
      : path.join(this.tempDir, filePath);
  }

  async readFile(filePath: string): Promise<Buffer> {
    return fs.readFile(this.resolveAbsolutePath(filePath));
  }
}
