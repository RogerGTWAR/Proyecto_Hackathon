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

import { ProviderScheduleService } from './provider-schedule.service';
import { CreateProviderScheduleDto } from './dto/create-provider-schedule.dto';
import { UpdateProviderScheduleDto } from './dto/update-provider-schedule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('provider-schedule')
@UseGuards(JwtAuthGuard)
export class ProviderScheduleController {
  constructor(
    private readonly providerScheduleService: ProviderScheduleService,
  ) {}

  @Post()
  create(@Body() createDto: CreateProviderScheduleDto) {
    return this.providerScheduleService.create(createDto);
  }

  @Get()
  findAll() {
    return this.providerScheduleService.findAll();
  }

  @Get('deleted')
  findDeleted() {
    return this.providerScheduleService.findDeleted();
  }

  @Get('provider/:providerId')
  findByProviderId(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.providerScheduleService.findByProviderId(providerId);
  }

  @Get(':providerScheduleId')
  findOne(
    @Param('providerScheduleId', ParseIntPipe) providerScheduleId: number,
  ) {
    return this.providerScheduleService.findOne(providerScheduleId);
  }

  @Patch(':providerScheduleId')
  update(
    @Param('providerScheduleId', ParseIntPipe) providerScheduleId: number,
    @Body() updateDto: UpdateProviderScheduleDto,
  ) {
    return this.providerScheduleService.update(providerScheduleId, updateDto);
  }

  @Delete(':providerScheduleId')
  softDelete(
    @Param('providerScheduleId', ParseIntPipe) providerScheduleId: number,
  ) {
    return this.providerScheduleService.softDelete(providerScheduleId);
  }

  @Patch(':providerScheduleId/restore')
  restore(
    @Param('providerScheduleId', ParseIntPipe) providerScheduleId: number,
  ) {
    return this.providerScheduleService.restore(providerScheduleId);
  }
}