import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { RpcErrorPayload } from './rpc.types';

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }

    const status = exception?.getStatus?.();

    if (status === 400) {
      const response = exception?.getResponse?.();

      const details =
        typeof response === 'object' &&
        response !== null &&
        'message' in response
          ? response.message
          : response;

      const payload: RpcErrorPayload = {
        code: 'VALIDATION_ERROR',
        message: 'Validation Error',
        details,
      };

      return super.catch(new RpcException(payload), host);
    }

    this.logger.error(
      'Unhandled microservice exception',
      exception?.stack ?? exception,
    );

    const payload: RpcErrorPayload = {
      code: 'INTERNAL',
      message: 'Internal Server Error',
    };

    return super.catch(new RpcException(payload), host);
  }
}
