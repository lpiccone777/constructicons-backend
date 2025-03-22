import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProveedoresService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(categoria?: string) {
    const where: Record<string, any> = {};
    
    if (categoria) {
      where.categorias = {
        has: categoria
      };
    }
    
    return this.prisma.proveedor.findMany({
      where,
      include: {
        _count: {
          select: { contactos: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });
  }

  async findById(id: number) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id },
      include: {
        contactos: true
      }
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }

    return proveedor;
  }

  async create(createProveedorDto: CreateProveedorDto, usuarioId: number) {
    // Verificar si ya existe un proveedor con el mismo código
    const existingProveedor = await this.prisma.proveedor.findUnique({
      where: { codigo: createProveedorDto.codigo }
    });

    if (existingProveedor) {
      throw new ConflictException(`Ya existe un proveedor con el código ${createProveedorDto.codigo}`);
    }

    // Preparar datos con los tipos correctos
    const proveedorData = {
      ...createProveedorDto,
      descuento: createProveedorDto.descuento ? new Decimal(createProveedorDto.descuento) : null,
    };

    // Crear el proveedor
    const nuevoProveedor = await this.prisma.proveedor.create({
      data: proveedorData
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'inserción',
      'Proveedor',
      nuevoProveedor.id.toString(),
      {
        codigo: nuevoProveedor.codigo,
        nombre: nuevoProveedor.nombre
      }
    );

    return nuevoProveedor;
  }

  async update(id: number, updateProveedorDto: UpdateProveedorDto, usuarioId: number) {
    // Verificar si el proveedor existe
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id }
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }

    // Verificar si se está actualizando el código y si ya existe
    if (updateProveedorDto.codigo && updateProveedorDto.codigo !== proveedor.codigo) {
      const existingProveedor = await this.prisma.proveedor.findUnique({
        where: { codigo: updateProveedorDto.codigo }
      });

      if (existingProveedor) {
        throw new ConflictException(`Ya existe un proveedor con el código ${updateProveedorDto.codigo}`);
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
      data: updateData
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'Proveedor',
      id.toString(),
      { cambios: updateProveedorDto }
    );

    return proveedorActualizado;
  }

  async delete(id: number, usuarioId: number) {
    // Verificar si el proveedor existe
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id },
      include: {
        contactos: true
      }
    });
  
    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
  
    try {
      // Usar transacción para eliminar proveedor y sus contactos
      await this.prisma.$transaction(async (prisma) => {
        // Primero eliminar contactos asociados
        if (proveedor.contactos.length > 0) {
          await prisma.contactoProveedor.deleteMany({
            where: { proveedorId: id }
          });
        }
        
        // Luego eliminar el proveedor
        await prisma.proveedor.delete({
          where: { id }
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
          nombre: proveedor.nombre
        }
      );
    } catch (error) {
      // Corrección aquí
      if (error instanceof Error && 'code' in error && error.code === 'P2003') { // Foreign key constraint failed
        throw new ConflictException(`No se puede eliminar el proveedor porque tiene relaciones con otras entidades`);
      }
      throw error;
    }
  }

  // Métodos para manejo de contactos
  async findContactos(proveedorId: number) {
    // Verificar si el proveedor existe
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id: proveedorId }
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${proveedorId} no encontrado`);
    }

    return this.prisma.contactoProveedor.findMany({
      where: { proveedorId }
    });
  }

  async findContactoById(id: number) {
    const contacto = await this.prisma.contactoProveedor.findUnique({
      where: { id },
      include: {
        proveedor: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      }
    });

    if (!contacto) {
      throw new NotFoundException(`Contacto con ID ${id} no encontrado`);
    }

    return contacto;
  }

  async createContacto(createContactoDto: CreateContactoDto, usuarioId: number) {
    // Verificar si el proveedor existe
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id: createContactoDto.proveedorId }
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${createContactoDto.proveedorId} no encontrado`);
    }

    // Si el contacto es principal, actualizar otros contactos
    if (createContactoDto.esPrincipal) {
      await this.prisma.contactoProveedor.updateMany({
        where: { 
          proveedorId: createContactoDto.proveedorId,
          esPrincipal: true
        },
        data: { esPrincipal: false }
      });
    }

    // Crear el contacto
    const nuevoContacto = await this.prisma.contactoProveedor.create({
      data: createContactoDto
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'inserción',
      'ContactoProveedor',
      nuevoContacto.id.toString(),
      {
        proveedorId: nuevoContacto.proveedorId,
        nombre: nuevoContacto.nombre
      }
    );

    return nuevoContacto;
  }

  async updateContacto(id: number, updateContactoDto: UpdateContactoDto, usuarioId: number) {
    // Verificar si el contacto existe
    const contacto = await this.prisma.contactoProveedor.findUnique({
      where: { id }
    });

    if (!contacto) {
      throw new NotFoundException(`Contacto con ID ${id} no encontrado`);
    }

    // Si se está marcando como principal, actualizar otros contactos
    if (updateContactoDto.esPrincipal) {
      await this.prisma.contactoProveedor.updateMany({
        where: { 
          proveedorId: contacto.proveedorId,
          id: { not: id },
          esPrincipal: true
        },
        data: { esPrincipal: false }
      });
    }

    // Actualizar el contacto
    const contactoActualizado = await this.prisma.contactoProveedor.update({
      where: { id },
      data: updateContactoDto
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'ContactoProveedor',
      id.toString(),
      { cambios: updateContactoDto }
    );

    return contactoActualizado;
  }

  async deleteContacto(id: number, usuarioId: number) {
    // Verificar si el contacto existe
    const contacto = await this.prisma.contactoProveedor.findUnique({
      where: { id }
    });

    if (!contacto) {
      throw new NotFoundException(`Contacto con ID ${id} no encontrado`);
    }

    // Eliminar el contacto
    await this.prisma.contactoProveedor.delete({
      where: { id }
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'borrado',
      'ContactoProveedor',
      id.toString(),
      {
        proveedorId: contacto.proveedorId,
        nombre: contacto.nombre
      }
    );
  }
}