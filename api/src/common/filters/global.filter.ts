import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { Request, Response } from 'express';
import { TypeORMError } from 'typeorm';

@Catch()
export class GlobalFilter extends ExceptionsHandler {
  catch(exception: any, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request: Request = http.getRequest();
    const response: Response = http.getResponse();

    if (exception instanceof HttpException) {
      response.statusCode = exception.getStatus();
    }

    if (exception instanceof TypeORMError) {
      response.statusCode = 400;
    }

    response.status(response.statusCode).json({ message: exception.message });
  }
}
