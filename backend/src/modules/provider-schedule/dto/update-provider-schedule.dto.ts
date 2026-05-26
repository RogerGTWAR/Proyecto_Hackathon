import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderScheduleDto } from './create-provider-schedule.dto';

export class UpdateProviderScheduleDto extends PartialType(
  CreateProviderScheduleDto,
) {}