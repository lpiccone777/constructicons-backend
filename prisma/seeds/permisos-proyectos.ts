import { PrismaClient } from '@prisma/client';

// Este script crea los permisos necesarios para el módulo de materiales
async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Permisos para el módulo de materiales
    const permisosMateriales = [
      {
        nombre: 'materiales.leer',
        descripcion: 'Permiso para ver materiales y sus detalles',
        modulo: 'materiales',
        accion: 'leer',
      },
      {
        nombre: 'materiales.crear',
        descripcion: 'Permiso para crear nuevos materiales',
        modulo: 'materiales',
        accion: 'crear',
      },
      {
        nombre: 'materiales.actualizar',
        descripcion: 'Permiso para actualizar materiales existentes',
        modulo: 'materiales',
        accion: 'actualizar',
      },
      {
        nombre: 'materiales.eliminar',
        descripcion: 'Permiso para eliminar materiales',
        modulo: 'materiales',
        accion: 'eliminar',
      }
    ];

    console.log('Creando permisos para el módulo de materiales...');
    
    // Insertar los permisos
    for (const permiso of permisosMateriales) {
      // Verificar si ya existe el permiso
      const existingPermiso = await prisma.permiso.findUnique({
        where: { nombre: permiso.nombre }
      });
      
      if (!existingPermiso) {
        await prisma.permiso.create({
          data: permiso
        });
        console.log(`Permiso creado: ${permiso.nombre}`);
      } else {
        console.log(`Permiso ya existente: ${permiso.nombre}`);
      }
    }
    
    // Asignar los permisos a roles existentes
    // Supongamos que ya existen roles como "admin" y "director"
    
    const roles = ['admin', 'director', 'gestor'];
    
    for (const rolNombre of roles) {
      const rol = await prisma.rol.findFirst({
        where: { nombre: rolNombre }
      });
      
      if (rol) {
        // Conectar todos los permisos de materiales a este rol
        const permisos = await prisma.permiso.findMany({
          where: { modulo: 'materiales' }
        });
        
        await prisma.rol.update({
          where: { id: rol.id },
          data: {
            permisos: {
              connect: permisos.map(p => ({ id: p.id }))
            }
          }
        });
        
        console.log(`Permisos de materiales asignados al rol: ${rolNombre}`);
      } else {
        console.log(`Rol no encontrado: ${rolNombre}`);
      }
    }
    
    console.log('Permisos de materiales creados y asignados correctamente');
  } catch (error) {
    console.error('Error al crear permisos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });