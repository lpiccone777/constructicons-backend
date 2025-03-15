import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Usuario } from '@prisma/client';

export interface CreateUserDto {
  nombre: string;
  email: string;
  password: string;
  roles: string[];
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: { roles: true },
    });
  }

  async create(data: CreateUserDto): Promise<Usuario> {
    const rolesData = await Promise.all(
      data.roles.map(async (roleName) => {
        // Usamos findFirst en lugar de findUnique para buscar el rol por nombre
        let role = await this.prisma.rol.findFirst({
          where: { nombre: roleName },
        });
        if (!role) {
          role = await this.prisma.rol.create({
            data: { nombre: roleName },
          });
        }
        return { id: role.id };
      })
    );
  
    return this.prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        roles: { connect: rolesData },
      },
      include: { roles: true },
    });
  }

  async findAll() {
    return this.prisma.usuario.findMany({ include: { roles: true } });
  }
}
