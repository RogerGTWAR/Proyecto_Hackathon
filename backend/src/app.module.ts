import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkersModule  } from './modules/workers/workers.module';
import { WorkerScheduleModule } from './modules/worker-schedule/worker-schedule.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { CaslModule } from './modules/casl/casl.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot(databaseConfig()),

    UsersModule,
    AuthModule,
    WorkersModule,
    WorkerScheduleModule,
    FavoritesModule,
    CaslModule,
  ],
})
export class AppModule {}