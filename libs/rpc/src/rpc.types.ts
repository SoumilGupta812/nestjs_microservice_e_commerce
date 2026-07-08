export type RpcErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL'
  | 'VALIDATION_ERROR';

export type RpcErrorPayload = {
  code: RpcErrorCode;
  message: string;
  details?: any;
};
