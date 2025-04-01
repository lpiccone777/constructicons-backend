import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaErrorMapper } from '../../common/exceptions/prisma-error.mapper';
import {
  ProveedorNotFoundException,
  ProveedorConflictException,
  ProveedorDependenciesException
} from './exceptions/proveedor.exceptions';
import {
  ContactoProveedorNotFoundException
} from './exceptions/contacto-proveedor.exceptions';

@Injectable()
export class ProveedoresService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(categoria?: string) {
    try {
      const where: Record<string, any> = {};

      if (categoria) {
        where.categorias = {
          has: categoria,
        };
      }

      return await this.prisma.proveedor.findMany({
        where,
        include: {
          _count: {
            select: { contactos: true },
          },
        },
        orderBy: { nombre: 'asc' },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(
        error,
        'proveedor',
        'listar',
        { categoria }
      );
    }
  }

  async findById(id: number) {
    try {
      const proveedor = await this.getProveedorOrFail(id);
      return proveedor;
    } catch (error) {
      if (error instanceof ProveedorNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error,
        'proveedor',
        'consultar',
        { id }
      );
    }
  }

  async create(createProveedorDto: CreateProveedorDto, usuarioId: number) {
    try {
      // Verificar si ya existe un proveedor con el mismo código
      const existingProveedor = await this.prisma.proveedor.findUnique({
        where: { codigo: createProveedorDto.codigo },
      });

      if (existingProveedor) {
        throw new ProveedorConflictException(createProveedorDto.nombre);
      }

      // Preparar datos con los tipos correctos
      const proveedorData = {
        ...createProveedorDto,
        descuento: createProveedorDto.descuento
          ? new Decimal(createProveedorDto.descuento)
          : null,
      };

      // Crear el proveedor
      const nuevoProveedor = await this.prisma.proveedor.create({
        data: proveedorData,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'Proveedor',
        nuevoProveedor.id.toString(),
        {
          codigo: nuevoProveedor.codigo,
          nombre: nuevoProveedor.nombre,
        },
      );

      return nuevoProveedor;
    } catch (error) {
      if (error instanceof ProveedorConflictException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error,
        'proveedor',
        'crear',
        { createProveedorDto }
      );
    }
  }

  async update(
    id: number,
    updateProveedorDto: UpdateProveedorDto,
    usuarioId: number,
  ) {
    try {
      // Verificar si el proveedor existe
      const proveedor = await this.getProveedorOrFail(id);

      // Verificar si se está actualizando el código y si ya existe
      if (
        updateProveedorDto.codigo &&
        updateProveedorDto.codigo !== proveedor.codigo
      ) {
        const existingProveedor = await this.prisma.proveedor.findUnique({
          where: { codigo: updateProveedorDto.codigo },
        });

        if (existingProveedor) {
          throw new ProveedorConflictException(updateProveedorDto.nombre || proveedor.nombre);
        }
      }

      // Preparar datos para actualización
      const updateData: any = { ...updateProveedorDto };

      if (updateProveedorDto.descuento) {
        updateData.descuento = new Decimal(updateProveedorDto.descuento);
      }

      // Actualizar el proveedor
      const proveedorActualizado = await this.prisma.proveedor.update({
        where: { id },
        data: updateData,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'Proveedor',
        id.toString(),
        { cambios: updateProveedorDto },
      );

      return proveedorActualizado;
    } catch (error) {
      if (
        error instanceof ProveedorNotFoundException ||
        error instanceof ProveedorConflictException
      ) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error,
        'proveedor',
        'actualizar',
        { id, updateProveedorDto }
      );
    }
  }

  async delete(id: number, usuarioId: number) {
    try {
      // Verificar si el proveedor existe
      const proveedor = await this.getProveedorOrFail(id, { 
        include: { contactos: true } 
      });

      // Verificar si tiene dependencias (materiales-proveedores)
      const materialesProveedores = await this.prisma.materialProveedor.count({
        where: { proveedorId: id },
      });

      if (materialesProveedores > 0) {
        throw new ProveedorDependenciesException(id, ['materiales']);
      }

      // Usar transacción para eliminar proveedor y sus contactos
      await this.prisma.$transaction(async (prisma) => {
        // Eliminar contactos asociados, independientemente de si hay o no
        await prisma.contactoProveedor.deleteMany({
          where: { proveedorId: id },
        });

        // Luego eliminar el proveedor
        await prisma.proveedor.delete({
          where: { id },
        });
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'borrado',
        'Proveedor',
        id.toString(),
        {
          codigo: proveedor.codigo,
          nombre: proveedor.nombre,
        },
      );
      
      return { id };
    } catch (error) {
      if (
        error instanceof ProveedorNotFoundException ||
        error instanceof ProveedorDependenciesException
      ) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error,
        'proveedor',
        'eliminar',
        { id }
      );
    }
  }

  // Métodos para manejo de contactos
  async findContactos(proveedorId: number) {
    try {
      // Verificar si el proveedor existe
      await this.getProveedorOrFail(proveedorId);

      return await this.prisma.contactoProveedor.findMany({
        where: { proveedorId },
      });
    } catch (error) {
      if (error instanceof ProveedorNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error,
        'contacto-proveedor',
        'listar',
        { proveedorId }
      );
    }
  }

  async findContactoById(id: number) {
    try {
      const contacto = await this.getContactoOrFail(id);
      return contacto;
    } catch (error) {
      if (error instanceof ContactoProveedorNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error,
        'contacto-proveedor',
        'consultar',
        { id }
      );
    }
  }

  async createContacto(
    createContactoDto: CreateContactoDto,
    usuarioId: number,
  ) {
    try {
      // Verificar si el proveedor existe
      await this.getProveedorOrFail(createContactoDto.proveedorId);

      // Si el contacto es principal, actualizar otros contactos
      if (createContactoDto.esPrincipal) {
        await this.prisma.contactoProveedor.updateMany({
          where: {
            proveedorId: createContactoDto.proveedorId,
            esPrincipal: true,
          },
          data: { esPrincipal: false },
        });
      }

      // Crear el contacto
      const nuevoContacto = await this.prisma.contactoProveedor.create({
        data: createContactoDto,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'ContactoProveedor',
        nuevoContacto.id.toString(),
        {
          proveedorId: nuevoContacto.proveedorId,
          nombre: nuevoContacto.nombre,
        },
      );

      return nuevoContacto;
    } catch (error) {
      if (error instanceof ProveedorNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error,
        'contacto-proveedor',
        'crear',
        { createContactoDto }
      );
    }
  }

  async updateContacto(
    id: number,
    updateContactoDto: UpdateContactoDto,
    usuarioId: number,
  ) {
    try {
      // Verificar si el contacto existe
      const contacto = await this.getContactoOrFail(id);

      // Si se está marcando como principal, actualizar otros contactos
      if (updateContactoDto.esPrincipal) {
        await this.prisma.contactoProveedor.updateMany({
          where: {
            proveedorId: contacto.proveedorId,
            id: { not: id },
            esPrincipal: true,
          },
          data: { esPrincipal: false },
        });
      }

      // Actualizar el contacto
      const contactoActualizado = await this.prisma.contactoProveedor.update({
        where: { id },
        data: updateContactoDto,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'ContactoProveedor',
        id.toString(),
        { cambios: updateContactoDto },
      );

      return contactoActualizado;
    } catch (error) {
      if (error instanceof ContactoProveedorNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error,
        'contacto-proveedor',
        'actualizar',
        { id, updateContactoDto }
      );
    }
  }

  async deleteContacto(id: number, usuarioId: number) {
    try {
      // Verificar si el contacto existe
      const contacto = await this.getContactoOrFail(id);

      // Eliminar el contacto
      await this.prisma.contactoProveedor.delete({
        where: { id },
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'borrado',
        'ContactoProveedor',
        id.toString(),
        {
          proveedorId: contacto.proveedorId,
          nombre: contacto.nombre,
        },
      );
      
      return { id };
    } catch (error) {
      if (error instanceof ContactoProveedorNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error,
        'contacto-proveedor',
        'eliminar',
        { id }
      );
    }
  }

  /**
   * Método auxiliar para obtener un proveedor o lanzar excepción si no existe
   */
  private async getProveedorOrFail(id: number, options?: any) {
    try {
      const findOptions: any = { where: { id } };
      
      if (options?.include) {
        findOptions.include = options.include;
      } else {
        findOptions.include = { contactos: true };
      }

      const proveedor = await this.prisma.proveedor.findUnique(findOptions);
      
      if (!proveedor) {
        throw new ProveedorNotFoundException(id);
      }
      
      return proveedor;
    } catch (error) {
      if (error instanceof ProveedorNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error,
        'proveedor',
        'consultar',
        { id }
      );
    }
  }

  /**
   * Método auxiliar para obtener un contacto o lanzar excepción si no existe
   */
  private async getContactoOrFail(id: number) {
    try {
      const contacto = await this.prisma.contactoProveedor.findUnique({
        where: { id },
        include: {
          proveedor: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
        },
      });
      
      if (!contacto) {
        throw new ContactoProveedorNotFoundException(id);
      }
      
      return contacto;
    } catch (error) {
      if (error instanceof ContactoProveedorNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error,
        'contacto-proveedor',
        'consultar',
        { id }
      );
    }
  }
}