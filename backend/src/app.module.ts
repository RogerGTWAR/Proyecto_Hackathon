import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { LocationsModule } from './modules/locations/locations.module';
import { ProviderScheduleModule } from './modules/provider-schedule/provider-schedule.module';
import { FavoritesModule } from './modules/favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot(databaseConfig()),

    UsersModule,
    AuthModule,
    ProvidersModule,
    LocationsModule,
    ProviderScheduleModule,
    FavoritesModule,
  ],
})
export class AppModule {}