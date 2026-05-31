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
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { Action } from '../casl/actions.enum';
import { Favorite } from './entities/favorite.entity';

@Controller('favorites')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, Favorite))
  create(
    @Body() createFavoriteDto: CreateFavoriteDto,
    @CurrentUser() user: any,
  ) {
    return this.favoritesService.create(createFavoriteDto, user);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, Favorite))
  findAll(@CurrentUser() user: any) {
    return this.favoritesService.findAll(user);
  }

  @Get('deleted')
  @CheckPolicies((ability) => ability.can(Action.Read, Favorite))
  findDeleted(@CurrentUser() user: any) {
    return this.favoritesService.findDeleted(user);
  }

  @Get('user/:userId')
  @CheckPolicies((ability) => ability.can(Action.Read, Favorite))
  findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: any,
  ) {
    return this.favoritesService.findByUserId(userId, user);
  }

  @Get('worker/:workerId')
  @CheckPolicies((ability) => ability.can(Action.Read, Favorite))
  findByWorkerId(
    @Param('workerId', ParseIntPipe) workerId: number,
    @CurrentUser() user: any,
  ) {
    return this.favoritesService.findByWorkerId(workerId, user);
  }

  @Get(':favoriteId')
  @CheckPolicies((ability) => ability.can(Action.Read, Favorite))
  findOne(
    @Param('favoriteId', ParseIntPipe) favoriteId: number,
    @CurrentUser() user: any,
  ) {
    return this.favoritesService.findOne(favoriteId, user);
  }

  @Patch(':favoriteId')
  @CheckPolicies((ability) => ability.can(Action.Update, Favorite))
  update(
    @Param('favoriteId', ParseIntPipe) favoriteId: number,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
    @CurrentUser() user: any,
  ) {
    return this.favoritesService.update(favoriteId, updateFavoriteDto, user);
  }

  @Delete(':favoriteId')
  @CheckPolicies((ability) => ability.can(Action.Delete, Favorite))
  softDelete(
    @Param('favoriteId', ParseIntPipe) favoriteId: number,
    @CurrentUser() user: any,
  ) {
    return this.favoritesService.softDelete(favoriteId, user);
  }

  @Delete('user/:userId/worker/:workerId')
  @CheckPolicies((ability) => ability.can(Action.Delete, Favorite))
  removeByUserAndWorker(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('workerId', ParseIntPipe) workerId: number,
    @CurrentUser() user: any,
  ) {
    return this.favoritesService.removeByUserAndWorker(userId, workerId, user);
  }

  @Patch(':favoriteId/restore')
  @CheckPolicies((ability) => ability.can(Action.Restore, Favorite))
  restore(
    @Param('favoriteId', ParseIntPipe) favoriteId: number,
    @CurrentUser() user: any,
  ) {
    return this.favoritesService.restore(favoriteId, user);
  }
}