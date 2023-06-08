import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateTenantDTO } from "./create-tenant.dto";

export class UpdateTenantDTO extends PartialType(CreateTenantDTO) {

}