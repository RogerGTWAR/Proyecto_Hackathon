import { WorkerStatus } from '../entities/worker.entity';

export class WorkerResponseDto {
  workerId!: number;
  userId!: number;
  description!: string | null;
  experience!: string | null;
  averageRating!: number;
  totalJobs!: number;
  status!: WorkerStatus;
  createdAt!: Date;
  updatedAt!: Date;
}