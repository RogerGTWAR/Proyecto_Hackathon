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

import { WorkerScheduleService } from './worker-schedule.service';
import { CreateWorkerScheduleDto } from './dto/create-worker-schedule.dto';
import { UpdateWorkerScheduleDto } from './dto/update-worker-schedule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { Action } from '../casl/actions.enum';
import { WorkerSchedule } from './entities/worker-schedule.entity';

@Controller('worker-schedule')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class WorkerScheduleController {
  constructor(
    private readonly workerScheduleService: WorkerScheduleService,
  ) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, WorkerSchedule))
  create(
    @Body() createDto: CreateWorkerScheduleDto,
    @CurrentUser() user: any,
  ) {
    return this.workerScheduleService.create(createDto, user);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, WorkerSchedule))
  findAll() {
    return this.workerScheduleService.findAll();
  }

  @Get('deleted')
  @CheckPolicies((ability) => ability.can(Action.Read, WorkerSchedule))
  findDeleted(@CurrentUser() user: any) {
    return this.workerScheduleService.findDeleted(user);
  }

  @Get('worker/:workerId')
  @CheckPolicies((ability) => ability.can(Action.Read, WorkerSchedule))
  findByWorkerId(
    @Param('workerId', ParseIntPipe) workerId: number,
    @CurrentUser() user: any,
  ) {
    return this.workerScheduleService.findByWorkerId(workerId, user);
  }

  @Patch(':scheduleId')
  @CheckPolicies((ability) => ability.can(Action.Update, WorkerSchedule))
  update(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() updateDto: UpdateWorkerScheduleDto,
    @CurrentUser() user: any,
  ) {
    return this.workerScheduleService.update(scheduleId, updateDto, user);
  }

  @Delete(':scheduleId')
  @CheckPolicies((ability) => ability.can(Action.Delete, WorkerSchedule))
  softDelete(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @CurrentUser() user: any,
  ) {
    return this.workerScheduleService.softDelete(scheduleId, user);
  }

  @Patch(':scheduleId/restore')
  @CheckPolicies((ability) => ability.can(Action.Restore, WorkerSchedule))
  restore(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @CurrentUser() user: any,
  ) {
    return this.workerScheduleService.restore(scheduleId, user);
  }
}