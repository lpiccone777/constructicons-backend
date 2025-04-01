// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Usuario } from '@prisma/client';
import { PrismaErrorMapper } from '../common/exceptions/prisma-error.mapper';
import {
  InvalidCredentialsException,
  TokenExpiredException,
  InactiveUserException,
} from './exceptions';
import {
  UserNotFoundException,
  UserEmailConflictException,
} from '../users/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) return null;

      // Verificar si el usuario está activo
      if (user.estado === 'inactivo') {
        throw new InactiveUserException(email);
      }

      if (await bcrypt.compare(password, user.password)) {
        // Actualizar última actividad del usuario
        await this.usersService.actualizarUltimaActividad(user.id);

        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      // Si es una excepción conocida de inactividad, la propagamos
      if (error instanceof InactiveUserException) {
        throw error;
      }
      // Para otros errores inesperados, mapeamos a error de autenticación
      throw PrismaErrorMapper.map(error, 'auth', 'validar-usuario', { email });
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        throw new InvalidCredentialsException();
      }

      // Preparar la información de roles y permisos para el token
      const roles = user.roles.map((r: any) => r.nombre);
      const permisos = new Set<string>();

      // Extraer todos los permisos únicos de todos los roles
      user.roles.forEach((rol: any) => {
        rol.permisos.forEach((permiso: any) => {
          permisos.add(`${permiso.modulo}.${permiso.accion}`);
        });
      });

      const payload = {
        sub: user.id,
        email: user.email,
        roles,
        permisos: Array.from(permisos),
        esSuperUsuario: user.esSuperUsuario,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          roles,
          permisos: Array.from(permisos),
          esSuperUsuario: user.esSuperUsuario,
        },
      };
    } catch (error) {
      // Si es una excepción de autenticación conocida, la propagamos
      if (
        error instanceof InvalidCredentialsException ||
        error instanceof InactiveUserException
      ) {
        throw error;
      }
      // Para otros errores inesperados, mapeamos
      throw PrismaErrorMapper.map(error, 'auth', 'login', {
        email: loginDto.email,
      });
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        throw new UserEmailConflictException(registerDto.email);
      }

      // Determinar si es el super usuario
      const esSuperUsuario = registerDto.email === 'asesorpicconel@gmail.com';

      const newUser = await this.usersService.create({
        nombre: registerDto.nombre,
        email: registerDto.email,
        password: registerDto.password,
        roles: registerDto.roles || ['user'],
        esSuperUsuario,
      });

      const { password, ...result } = newUser;
      return result;
    } catch (error) {
      // Si es una excepción conocida, la propagamos
      if (error instanceof UserEmailConflictException) {
        throw error;
      }
      // Para otros errores inesperados, mapeamos
      throw PrismaErrorMapper.map(error, 'auth', 'registro', {
        email: registerDto.email,
      });
    }
  }

  async getProfile(userId: number) {
    try {
      const user = await this.usersService.findById(userId);

      // Necesitamos hacer una aserción de tipo para TypeScript
      const userWithRoles = user as any;

      // Preparar la información de roles y permisos
      const roles = userWithRoles.roles?.map((r: any) => r.nombre) || [];
      const permisos = new Set<string>();

      // Extraer todos los permisos únicos de todos los roles
      if (userWithRoles.roles) {
        userWithRoles.roles.forEach((rol: any) => {
          if (rol.permisos) {
            rol.permisos.forEach((permiso: any) => {
              permisos.add(`${permiso.modulo}.${permiso.accion}`);
            });
          }
        });
      }

      const { password, ...userInfo } = user;

      return {
        ...userInfo,
        roles,
        permisos: Array.from(permisos),
      };
    } catch (error) {
      // Si es una excepción conocida, la propagamos
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      // Para otros errores inesperados, mapeamos
      throw PrismaErrorMapper.map(error, 'auth', 'obtener-perfil', { userId });
    }
  }

  async checkToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return { 
        valid: true, 
        userId: payload.sub 
      };
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new TokenExpiredException();
      }
      return { valid: false };
    }
  }
}
