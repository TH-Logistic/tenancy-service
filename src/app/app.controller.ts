import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { createReadStream } from "fs";
import { join } from "path";

@Controller()
export class AppController {
    @Get('/files/keys/:tenantId')
    getFile(@Res() res: Response, @Param('tenantId') tenantId: string) {
        const file = createReadStream(join(process.cwd(), '/temp/infrastructure/', `${tenantId}.pem`));
        file.pipe(res);
    }
}