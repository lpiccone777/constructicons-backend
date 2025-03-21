import { PrismaClient } from '@prisma/client';

// Este script crea los permisos necesarios para el módulo de proyectos
async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Permisos para el módulo de proyectos
    const permisosProyectos = [
      {
        nombre: 'proyectos.leer',
        descripcion: 'Permiso para ver proyectos y sus detalles',
        modulo: 'proyectos',
        accion: 'leer',
      },
      {
        nombre: 'proyectos.crear',
        descripcion: 'Permiso para crear nuevos proyectos y sus componentes',
        modulo: 'proyectos',
        accion: 'crear',
      },
      {
        nombre: 'proyectos.actualizar',
        descripcion: 'Permiso para actualizar proyectos existentes',
        modulo: 'proyectos',
        accion: 'actualizar',
      },
      {
        nombre: 'proyectos.eliminar',
        descripcion: 'Permiso para eliminar proyectos',
        modulo: 'proyectos',
        accion: 'eliminar',
      }
    ];

    console.log('Creando permisos para el módulo de proyectos...');
    
    // Insertar los permisos
    for (const permiso of permisosProyectos) {
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
        // Conectar todos los permisos de proyectos a este rol
        const permisos = await prisma.permiso.findMany({
          where: { modulo: 'proyectos' }
        });
        
        await prisma.rol.update({
          where: { id: rol.id },
          data: {
            permisos: {
              connect: permisos.map(p => ({ id: p.id }))
            }
          }
        });
        
        console.log(`Permisos de proyectos asignados al rol: ${rolNombre}`);
      } else {
        console.log(`Rol no encontrado: ${rolNombre}`);
      }
    }
    
    console.log('Permisos de proyectos creados y asignados correctamente');
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