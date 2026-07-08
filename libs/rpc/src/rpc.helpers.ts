import { RpcException } from '@nestjs/microservices';
import { RpcErrorPayload } from './rpc.types';

export function rpcBadRequest(message: string, details?: any): never {
  const error: RpcErrorPayload = {
    code: 'BAD_REQUEST',
    message,
    details,
  };
  throw new RpcException(error);
}

export function rpcUnauthorized(
  message: string = 'Unauthorized',
  details?: any,
): never {
  const error: RpcErrorPayload = {
    code: 'UNAUTHORIZED',
    message,
    details,
  };
  throw new RpcException(error);
}

export function rpcForbidden(
  message: string = 'Forbidden',
  details?: any,
): never {
  const error: RpcErrorPayload = {
    code: 'FORBIDDEN',
    message,
    details,
  };
  throw new RpcException(error);
}

export function rpcNotFound(message: string, details?: any): never {
  const error: RpcErrorPayload = {
    code: 'NOT_FOUND',
    message,
    details,
  };
  throw new RpcException(error);
}

export function rpcInternalServerError(
  message = 'Internal Error',
  details?: any,
): never {
  const error: RpcErrorPayload = {
    code: 'INTERNAL',
    message,
    details,
  };
  throw new RpcException(error);
}

// export function rpcValidationError(
//   message: string = 'Validation Error',
//   details?: any,
// ): never {
//   const error: RpcErrorPayload = {
//     code: 'VALIDATION_ERROR',
//     message,
//     details,
//   };
//   throw new RpcException(error);
// }
