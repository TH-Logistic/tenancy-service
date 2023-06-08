import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { Tenant } from "./entities/tenant.schema";
import { CreateTenantDTO } from "./dto/create-tenant.dto";
import { UpdateTenantDTO } from "./dto/update-tenant.dto";

@Controller("/tenants")
export class TenantController {
    constructor(
        private readonly tenantService: TenantService
    ) {

    }

    @Get("/")
    async getTenants(): Promise<Tenant[]> {
        return this.tenantService.getTenants();
    }

    @Get("/:id")
    async getTenantById(@Param('id') id: string): Promise<Tenant> {
        return this.tenantService.getTenantById(id);
    }

    @Post("/")
    async createTenant(@Body() createTenantDTO: CreateTenantDTO): Promise<Tenant> {
        return this.tenantService.createTenant(createTenantDTO);
    }

    @Patch("/:id")
    async updateTenant(@Param('id') id: string, @Body() updateTenantDTO: UpdateTenantDTO): Promise<Tenant> {
        return this.tenantService.updateTenant(id, updateTenantDTO);
    }

    @Post("/:id/active")
    async activeTenant(@Param('id') id: string): Promise<boolean> {
        return this.tenantService.activeTenant(id)
    }

    @Post("/:id/suspend")
    async suspendTenant(@Param('id') id: string): Promise<boolean> {
        return this.tenantService.suspendTenant(id)
    }
}