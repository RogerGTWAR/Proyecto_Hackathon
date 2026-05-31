import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Worker } from './entities/worker.entity';
import { WorkersService } from './workers.service';
import { WorkersController } from './workers.controller';
import { UsersModule } from '../users/users.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Worker]),
    UsersModule,
    CaslModule,
  ],
  controllers: [WorkersController],
  providers: [WorkersService],
  exports: [WorkersService],
})
export class WorkersModule {}