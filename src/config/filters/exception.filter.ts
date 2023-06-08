import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, ForbiddenException, HttpException, HttpStatus, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { classToPlain } from "class-transformer";
import { isArray, isObject } from "class-validator";
import { Request, Response } from "express";
import { stat } from "fs";
import { BaseResponse } from "../dto/base.response";
import { MongooseError, mongo, Error as MongoError } from "mongoose";

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {

        const context = host.switchToHttp();
        const request = context.getRequest<Request>();
        const response = context.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Internal Server Error!";

        switch (exception.constructor) {
            case NotFoundException:
                const response = (exception as NotFoundException).getResponse()

                if (isObject(response)) {
                    message = (response as any).message;
                    status = (response as any).statusCode;
                } else {
                    message = response.toString()
                    status = (exception as NotFoundException).getStatus()
                }

                break;

            case BadRequestException:
                status = (exception as BadRequestException).getStatus();
                var exceptionResponse = (exception as BadRequestException).getResponse()
                if (isObject(exceptionResponse)) {
                    const rawMessage = (exceptionResponse as any).message
                    if (isArray(rawMessage)) {
                        message = (rawMessage as string[]).join("\n")
                    } else {
                        message = rawMessage
                    }
                } else {
                    message = exceptionResponse
                }
                break

            case UnauthorizedException:
                status = (exception as UnauthorizedException).getStatus();
                message = (exception as UnauthorizedException).message;
                break;

            case ForbiddenException:
                status = (exception as ForbiddenException).getStatus();
                message = (exception as ForbiddenException).message;
                break;

            case MongoError.DocumentNotFoundError:
                status = 404;
                message = (exception as MongoError).message;
                break;

            case MongooseError:
                status = 400;
                message = (exception as MongooseError).message;
                break
            case mongo.MongoServerError:
                status = 400;
                message = (exception as mongo.MongoServerError).errmsg
                break;

            case HttpException:
                status = exception.getStatus() ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
                message = (exception as HttpException).message
                break;
            case String:
                status = HttpStatus.INTERNAL_SERVER_ERROR
                message = exception
                break;
            default:
                message = exception.toString()
                break;
        }

        const body: BaseResponse<any> = {
            success: false,
            message: message,
            data: null,
        }
        response
            .status(status)
            .json(body);

    }

    private getExceptionMessage(exception: HttpException): string {
        const exceptionResponse = exception.getResponse();

        if (exceptionResponse) {
            if (isObject(exceptionResponse)) {
                return classToPlain(exceptionResponse).message;
            } else {
                return exceptionResponse as string;
            }
        } else {
            return exception.message
        }
    }
}