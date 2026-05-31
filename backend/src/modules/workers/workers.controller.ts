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

import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { Action } from '../casl/actions.enum';
import { Worker } from './entities/worker.entity';

@Controller('workers')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, Worker))
  create(
    @Body() createWorkerDto: CreateWorkerDto,
    @CurrentUser() user: any,
  ) {
    return this.workersService.create(createWorkerDto, user);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, Worker))
  findAll() {
    return this.workersService.findAll();
  }

  @Get('deleted')
  @CheckPolicies((ability) => ability.can(Action.Read, Worker))
  findDeleted(@CurrentUser() user: any) {
    return this.workersService.findDeleted(user);
  }

  @Get('user/:userId')
  @CheckPolicies((ability) => ability.can(Action.Read, Worker))
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.workersService.findByUserId(userId);
  }

  @Get(':workerId')
  @CheckPolicies((ability) => ability.can(Action.Read, Worker))
  findOne(@Param('workerId', ParseIntPipe) workerId: number) {
    return this.workersService.findOne(workerId);
  }

  @Patch(':workerId')
  @CheckPolicies((ability) => ability.can(Action.Update, Worker))
  update(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Body() updateWorkerDto: UpdateWorkerDto,
    @CurrentUser() user: any,
  ) {
    return this.workersService.update(workerId, updateWorkerDto, user);
  }

  @Delete(':workerId')
  @CheckPolicies((ability) => ability.can(Action.Delete, Worker))
  softDelete(
    @Param('workerId', ParseIntPipe) workerId: number,
    @CurrentUser() user: any,
  ) {
    return this.workersService.softDelete(workerId, user);
  }

  @Patch(':workerId/restore')
  @CheckPolicies((ability) => ability.can(Action.Restore, Worker))
  restore(
    @Param('workerId', ParseIntPipe) workerId: number,
    @CurrentUser() user: any,
  ) {
    return this.workersService.restore(workerId, user);
  }
}