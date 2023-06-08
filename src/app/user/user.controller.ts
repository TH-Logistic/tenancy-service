import { Body, Controller, Get, Param, Patch, Post, Query, Req, Version } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { Roles } from "src/config/guard/role.decorator";
import { UserService } from "./user.service";
import { IsEmail } from "class-validator";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { UserRole } from "./entities/role";

@Controller('/users')
export class UserController {
    constructor(private readonly userService: UserService) {

    }

    @Get()
    @Roles(UserRole.ADMIN)
    async getUsers() {
        return this.userService.findAll();
    }

    @Get('/:id')
    async getUserById(@Param('id') id: string) {
        return this.userService.findById(id);
    }

    @Get('/email/:email')
    async getUserByEmail(@Param('email') email: string) {
        return this.userService.findByEmail(email);
    }

    @Get('/username/:username')
    async getByUsername(@Param('username') username: string) {
        return this.userService.findByUsername(username);
    }

    @Post()
    async createUser(@Body() createUserDTO: CreateUserDTO) {
        return this.userService.createUser(createUserDTO);
    }

    @Patch('/:id')
    async updateUser(@Param('id') id: string, @Body() updateUserDTO: UpdateUserDTO) {
        return this.userService.updateUser(id, updateUserDTO);
    }
}