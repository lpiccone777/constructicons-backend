import { 
  Injectable,
  ConflictException,
  UnauthorizedException
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Usuario } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  // Retorna el usuario sin el campo password
  async validateUser(email: string, password: string): Promise<Omit<Usuario, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result as Omit<Usuario, 'password'>;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const payload = { 
      sub: user.id, 
      email: user.email, 
      roles: user.roles.map((r) => r.nombre) 
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = await this.usersService.create({
      nombre: registerDto.nombre,
      email: registerDto.email,
      password: hashedPassword,
      roles: registerDto.roles || ['user'],
    });
    const { password, ...result } = newUser;
    return result;
  }
}
