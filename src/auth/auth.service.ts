// src/auth/auth.service.ts
import { 
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException
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

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    
    // Verificar si el usuario está activo
    if (user.estado === 'inactivo') {
      return null;
    }
    
    if (await bcrypt.compare(password, user.password)) {
      // Actualizar última actividad del usuario
      await this.usersService.actualizarUltimaActividad(user.id);
      
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
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
      esSuperUsuario: user.esSuperUsuario
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        roles,
        permisos: Array.from(permisos),
        esSuperUsuario: user.esSuperUsuario
      }
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }
    
    // Determinar si es el super usuario
    const esSuperUsuario = registerDto.email === 'asesorpicconel@gmail.com';
    
    const newUser = await this.usersService.create({
      nombre: registerDto.nombre,
      email: registerDto.email,
      password: registerDto.password,
      roles: registerDto.roles || ['user'],
      esSuperUsuario
    });
    
    const { password, ...result } = newUser;
    return result;
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

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
      permisos: Array.from(permisos)
    };
  }
}