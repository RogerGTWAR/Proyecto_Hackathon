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

import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  create(@Body() createFavoriteDto: CreateFavoriteDto) {
    return this.favoritesService.create(createFavoriteDto);
  }

  @Get()
  findAll() {
    return this.favoritesService.findAll();
  }

  @Get('deleted')
  findDeleted() {
    return this.favoritesService.findDeleted();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.favoritesService.findByUserId(userId);
  }

  @Get('provider/:providerId')
  findByProviderId(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.favoritesService.findByProviderId(providerId);
  }

  @Get(':favoriteId')
  findOne(@Param('favoriteId', ParseIntPipe) favoriteId: number) {
    return this.favoritesService.findOne(favoriteId);
  }

  @Patch(':favoriteId')
  update(
    @Param('favoriteId', ParseIntPipe) favoriteId: number,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    return this.favoritesService.update(favoriteId, updateFavoriteDto);
  }

  @Delete(':favoriteId')
  softDelete(@Param('favoriteId', ParseIntPipe) favoriteId: number) {
    return this.favoritesService.softDelete(favoriteId);
  }

  @Delete('user/:userId/provider/:providerId')
  removeByUserAndProvider(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('providerId', ParseIntPipe) providerId: number,
  ) {
    return this.favoritesService.removeByUserAndProvider(userId, providerId);
  }

  @Patch(':favoriteId/restore')
  restore(@Param('favoriteId', ParseIntPipe) favoriteId: number) {
    return this.favoritesService.restore(favoriteId);
  }
}