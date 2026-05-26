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

import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  findAll() {
    return this.locationsService.findAll();
  }

  @Get('deleted')
  findDeleted() {
    return this.locationsService.findDeleted();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.locationsService.findByUserId(userId);
  }

  @Get(':locationId')
  findOne(@Param('locationId', ParseIntPipe) locationId: number) {
    return this.locationsService.findOne(locationId);
  }

  @Patch(':locationId')
  update(
    @Param('locationId', ParseIntPipe) locationId: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.update(locationId, updateLocationDto);
  }

  @Delete(':locationId')
  softDelete(@Param('locationId', ParseIntPipe) locationId: number) {
    return this.locationsService.softDelete(locationId);
  }

  @Patch(':locationId/restore')
  restore(@Param('locationId', ParseIntPipe) locationId: number) {
    return this.locationsService.restore(locationId);
  }
}