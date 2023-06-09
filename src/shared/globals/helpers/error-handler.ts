import HTTP_STATUS_CODES from 'http-status-codes';

export interface IErrorResponse {
  message: string;
  statusCose: number;
  status: string;
  serializeErrors: () => IError;
}

export interface IError {
  message: string;
  statusCode: number;
  status: string;
}

export abstract class CustomError extends Error {
  abstract status: string;
  abstract statusCose: number;

  constructor(message: string) {
    super(message);
  }

  serialzeErrors(): IError {
    return {
      message: this.message,
      status: this.status,
      statusCode: this.statusCose
    };
  }
}

export class JoiRequestValidationError extends CustomError {
  status = 'error';
  statusCose = HTTP_STATUS_CODES.BAD_REQUEST;

  constructor(message: string) {
    super(message);
  }
}

export class BadRequestError extends CustomError {
  status = 'error';
  statusCose = HTTP_STATUS_CODES.BAD_REQUEST;

  constructor(message: string) {
    super(message);
  }
}

export class NotfoundError extends CustomError {
  status = 'error';
  statusCose = HTTP_STATUS_CODES.NOT_FOUND;

  constructor(message: string) {
    super(message);
  }
}

export class UnAuthorizedError extends CustomError {
  status = 'error';
  statusCose = HTTP_STATUS_CODES.UNAUTHORIZED;

  constructor(message: string) {
    super(message);
  }
}

export class FileToLargeError extends CustomError {
  status = 'error';
  statusCose = HTTP_STATUS_CODES.REQUEST_TOO_LONG;

  constructor(message: string) {
    super(message);
  }
}

export class ServerError extends CustomError {
  status = 'error';
  statusCose = HTTP_STATUS_CODES.SERVICE_UNAVAILABLE;

  constructor(message: string) {
    super(message);
  }
}
