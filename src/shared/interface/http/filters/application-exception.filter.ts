import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApplicationError } from '../../../application/errors/application.error';

@Catch()
export class ApplicationExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      response.status(status).json(this.normalizeHttpPayload(payload, request.url, status));
      return;
    }

    if (exception instanceof ApplicationError) {
      const status = this.mapApplicationCodeToHttpStatus(exception.code);
      response.status(status).json({
        statusCode: status,
        code: exception.code,
        message: exception.message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const fallbackMessage = exception instanceof Error ? exception.message : 'Internal server error';
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: fallbackMessage,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private mapApplicationCodeToHttpStatus(code: string): HttpStatus {
    switch (code) {
      case 'NOT_FOUND':
        return HttpStatus.NOT_FOUND;
      case 'CONFLICT':
        return HttpStatus.CONFLICT;
      case 'VALIDATION_ERROR':
        return HttpStatus.UNPROCESSABLE_ENTITY;
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }

  private normalizeHttpPayload(payload: string | object, path: string, status: number): object {
    if (typeof payload === 'string') {
      return {
        statusCode: status,
        message: payload,
        path,
        timestamp: new Date().toISOString(),
      };
    }

    const payloadRecord = payload as Record<string, unknown>;
    return {
      statusCode: payloadRecord.statusCode ?? status,
      code: payloadRecord.error ?? 'HTTP_EXCEPTION',
      message: payloadRecord.message ?? 'HTTP Exception',
      path,
      timestamp: new Date().toISOString(),
    };
  }
}
