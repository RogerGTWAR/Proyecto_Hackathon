import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkerSchedule } from './entities/worker-schedule.entity';
import { WorkerScheduleService } from './worker-schedule.service';
import { WorkerScheduleController } from './worker-schedule.controller';
import { WorkersModule } from '../workers/workers.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkerSchedule]),
    WorkersModule,
    CaslModule,
  ],
  controllers: [WorkerScheduleController],
  providers: [WorkerScheduleService],
  exports: [WorkerScheduleService],
})
export class WorkerScheduleModule {}