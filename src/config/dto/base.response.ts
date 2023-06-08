export class BaseResponse<T>{
    success: boolean;
    message?: string;
    data?: T;
}