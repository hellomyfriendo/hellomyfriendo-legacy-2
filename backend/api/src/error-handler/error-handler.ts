import {Request, Response} from 'express';
import {isCelebrateError} from 'celebrate';
import {StatusCodes} from 'http-status-codes';
import {AlreadyExistsError, NotFoundError, UnauthorizedError} from '../errors';

class ErrorResponse {
  public readonly code: ErrorCode;
  public readonly message: string;

  constructor(code: ErrorCode, message: string) {
    this.code = code;
    this.message = message;
  }
}

enum ErrorCode {
  AlreadyExists = 'alreadyExists',
  GeneralError = 'generalError',
  InvalidRequest = 'invalidRequest',
  NotFound = 'notFound',
  Unauthorized = 'unauthorized',
}

class ErrorHandler {
  public async handleError(err: Error, req: Request, res: Response) {
    req.log.error({err});

    if (isCelebrateError(err)) {
      const errorMessage = Array.from(
        err.details,
        ([, value]) => value.message
      ).reduce(
        (message, nextErrorMessage) => `${message}\n${nextErrorMessage}`
      );

      return res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json(new ErrorResponse(ErrorCode.InvalidRequest, errorMessage));
    }

    if (err instanceof RangeError) {
      return res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json(new ErrorResponse(ErrorCode.InvalidRequest, err.message));
    }

    if (err instanceof AlreadyExistsError) {
      return res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json(new ErrorResponse(ErrorCode.AlreadyExists, err.message));
    }

    if (err instanceof NotFoundError) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(new ErrorResponse(ErrorCode.NotFound, err.message));
    }

    if (err instanceof UnauthorizedError) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(new ErrorResponse(ErrorCode.Unauthorized, 'Unauthorized'));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ErrorResponse(ErrorCode.GeneralError, 'Internal Server Error'));
  }
}

export const errorHandler = new ErrorHandler();
