import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const ALLOWED_MIME_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/octet-stream',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export function multerImageConfig(
  prefix: string,
  maxFiles = 5,
): MulterOptions {
  return {
    storage: diskStorage({
      destination: join(process.cwd(), 'estatico', 'imagenes'),
      filename: (_request, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        const filename = `${prefix}-${randomUUID()}${extension}`;
        callback(null, filename);
      },
    }),

    fileFilter: (_request, file, callback) => {
      const extension = extname(file.originalname).toLowerCase();
      const validMimeType = ALLOWED_MIME_TYPES.includes(file.mimetype);
      const validExtension = ALLOWED_EXTENSIONS.includes(extension);

      if (!validMimeType || !validExtension) {
        return callback(
          new BadRequestException(`Archivo no permitido: ${file.mimetype}`),
          false,
        );
      }

      callback(null, true);
    },

    limits: {
      fileSize: 5 * 1024 * 1024,
      files: maxFiles,
    },
  };
}