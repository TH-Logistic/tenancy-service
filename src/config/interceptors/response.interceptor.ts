import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { BaseResponse } from "../dto/base.response";

export class ResponseInterceptor<T> implements NestInterceptor<T, BaseResponse<T>>{
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<BaseResponse<T>> | Promise<Observable<BaseResponse<T>>> {
        return next
            .handle()
            .pipe(map(data => ({
                success: true,
                message: null,
                data: data,
            })));
    }
}