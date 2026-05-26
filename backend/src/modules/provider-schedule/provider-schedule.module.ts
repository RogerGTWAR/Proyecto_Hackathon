import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProviderSchedule } from './entities/provider-schedule.entity';
import { ProviderScheduleService } from './provider-schedule.service';
import { ProviderScheduleController } from './provider-schedule.controller';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderSchedule]), ProvidersModule],
  controllers: [ProviderScheduleController],
  providers: [ProviderScheduleService],
  exports: [ProviderScheduleService],
})
export class ProviderScheduleModule {}