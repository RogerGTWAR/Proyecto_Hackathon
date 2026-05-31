import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';

import { User, UserRole } from '../users/entities/user.entity';
import { Worker } from '../workers/entities/worker.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { WorkerSchedule } from '../worker-schedule/entities/worker-schedule.entity';
import { Action } from './actions.enum';

export type Subjects =
  | InferSubjects<
      typeof User | typeof Worker | typeof Favorite | typeof WorkerSchedule
    >
  | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

export type AuthUser = {
  userId: number;
  email: string;
  roles: UserRole[];
  fullName: string;
};

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthUser): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    const roles = user.roles ?? [];

    if (roles.includes(UserRole.ADMIN)) {
      can(Action.Manage, 'all');
    }

    if (roles.includes(UserRole.CLIENT)) {
      can(Action.Read, Worker);
      can(Action.Read, WorkerSchedule);

      can(Action.Create, Favorite);
      can(Action.Read, Favorite);
      can(Action.Update, Favorite);
      can(Action.Delete, Favorite);
      can(Action.Restore, Favorite);

      can(Action.Read, User);
      can(Action.Update, User);
    }

    if (roles.includes(UserRole.WORKER)) {
      can(Action.Read, Worker);
      can(Action.Create, Worker);
      can(Action.Update, Worker);
      can(Action.Delete, Worker);
      can(Action.Restore, Worker);

      can(Action.Read, WorkerSchedule);
      can(Action.Create, WorkerSchedule);
      can(Action.Update, WorkerSchedule);
      can(Action.Delete, WorkerSchedule);
      can(Action.Restore, WorkerSchedule);

      can(Action.Read, User);
      can(Action.Update, User);
    }

    cannot(Action.Delete, User).because(
      'No se permite eliminar usuarios desde permisos normales',
    );

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}