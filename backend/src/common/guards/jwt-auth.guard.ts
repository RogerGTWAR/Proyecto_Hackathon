import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    console.log('Authorization header:', request.headers.authorization);
    console.log('Cookie token:', request.cookies?.token);

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.log('JWT ERROR:', err);
      console.log('JWT INFO:', info);

      throw new UnauthorizedException('Token inválido o no enviado');
    }

    return user;
  }
}