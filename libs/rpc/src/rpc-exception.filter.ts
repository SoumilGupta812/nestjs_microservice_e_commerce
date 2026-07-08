import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { RpcErrorPayload } from './rpc.types';

//this filter run inside microservice process and catch all exceptions thrown by the microservice handlers. It will convert the exception into a RpcException with a proper RpcErrorPayload.
@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }

    const status = exception?.getStatus?.();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (status === 400) {
      const payload: RpcErrorPayload = {
        code: 'VALIDATION_ERROR',
        message: 'Validation Error',
        details: response,
      };
      return super.catch(new RpcException(payload), host);
    }

    const payload: RpcErrorPayload = {
      code: 'INTERNAL',
      message: 'Internal Server Error',
    };
    return super.catch(new RpcException(payload), host);
  }
}
