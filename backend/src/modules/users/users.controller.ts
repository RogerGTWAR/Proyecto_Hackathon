import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { Action } from '../casl/actions.enum';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /*
    Registro público.
    Un usuario nuevo todavía no tiene token.
  */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, User))
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user);
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Get('deleted')
  @CheckPolicies((ability) => ability.can(Action.Read, User))
  findDeleted(@CurrentUser() user: any) {
    return this.usersService.findDeleted(user);
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Get(':userId')
  @CheckPolicies((ability) => ability.can(Action.Read, User))
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: any,
  ) {
    return this.usersService.findOne(userId, user);
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Patch(':userId')
  @CheckPolicies((ability) => ability.can(Action.Update, User))
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.update(userId, updateUserDto, user);
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Delete(':userId')
  @CheckPolicies((ability) => ability.can(Action.Delete, User))
  softDelete(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: any,
  ) {
    return this.usersService.softDelete(userId, user);
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Patch(':userId/restore')
  @CheckPolicies((ability) => ability.can(Action.Restore, User))
  restore(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: any,
  ) {
    return this.usersService.restore(userId, user);
  }
}