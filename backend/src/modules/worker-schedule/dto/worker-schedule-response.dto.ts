export class WorkerScheduleResponseDto {
  scheduleId!: number;
  workerId!: number;
  dayOfWeek!: string;
  startTime!: string;
  endTime!: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}