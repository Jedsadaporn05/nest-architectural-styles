import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';
import { NotFoundError } from '../errors/not-found.error.js';

type HandledError = NotFoundError | Prisma.PrismaClientKnownRequestError;

@Catch(NotFoundError, Prisma.PrismaClientKnownRequestError)
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: HandledError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, message } = this.toHttp(exception);
    response.status(status).json({ statusCode: status, message });
  }

  private toHttp(exception: HandledError): { status: number; message: string } {
    if (exception instanceof NotFoundError) {
      return { status: HttpStatus.NOT_FOUND, message: exception.message };
    }
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'Value already exists (unique constraint)',
        };
      case 'P2025':
        return { status: HttpStatus.NOT_FOUND, message: 'Record not found' };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        };
    }
  }
}
