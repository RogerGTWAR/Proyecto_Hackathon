import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private sanitizeUser(user: any) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.isActive) {
      throw new BadRequestException('El usuario está inactivo');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: user.userId,
      userId: user.userId,
      email: user.email,
      rol: user.rol,
      name: user.name,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      ok: true,
      msg: 'Login exitoso',
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async me(userId: number) {
    const user = await this.usersService.findOneEntity(userId);

    return {
      ok: true,
      user,
    };
  }
}