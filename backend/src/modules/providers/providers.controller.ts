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

import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('providers')
@UseGuards(JwtAuthGuard)
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  create(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.create(createProviderDto);
  }

  @Get()
  findAll() {
    return this.providersService.findAll();
  }

  @Get('deleted')
  findDeleted() {
    return this.providersService.findDeleted();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.providersService.findByUserId(userId);
  }

  @Get(':providerId')
  findOne(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.providersService.findOne(providerId);
  }

  @Patch(':providerId')
  update(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    return this.providersService.update(providerId, updateProviderDto);
  }

  @Delete(':providerId')
  softDelete(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.providersService.softDelete(providerId);
  }

  @Patch(':providerId/restore')
  restore(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.providersService.restore(providerId);
  }
}