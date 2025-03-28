import { PrismaClient } from '@prisma/client';

// Este script crea permisos para todos los módulos del sistema
async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Definir todos los permisos por módulo
    const permisos = [
      // Usuarios
      {
        nombre: 'usuarios.leer',
        descripcion: 'Permiso para ver usuarios',
        modulo: 'usuarios',
        accion: 'leer',
      },
      {
        nombre: 'usuarios.crear',
        descripcion: 'Permiso para crear usuarios',
        modulo: 'usuarios',
        accion: 'crear',
      },
      {
        nombre: 'usuarios.actualizar',
        descripcion: 'Permiso para actualizar usuarios',
        modulo: 'usuarios',
        accion: 'actualizar',
      },
      {
        nombre: 'usuarios.eliminar',
        descripcion: 'Permiso para eliminar usuarios',
        modulo: 'usuarios',
        accion: 'eliminar',
      },

      // Proyectos
      {
        nombre: 'proyectos.leer',
        descripcion: 'Permiso para ver proyectos',
        modulo: 'proyectos',
        accion: 'leer',
      },
      {
        nombre: 'proyectos.crear',
        descripcion: 'Permiso para crear proyectos',
        modulo: 'proyectos',
        accion: 'crear',
      },
      {
        nombre: 'proyectos.actualizar',
        descripcion: 'Permiso para actualizar proyectos',
        modulo: 'proyectos',
        accion: 'actualizar',
      },
      {
        nombre: 'proyectos.eliminar',
        descripcion: 'Permiso para eliminar proyectos',
        modulo: 'proyectos',
        accion: 'eliminar',
      },

      // Etapas
      {
        nombre: 'etapas.leer',
        descripcion: 'Permiso para ver etapas de proyectos',
        modulo: 'etapas',
        accion: 'leer',
      },
      {
        nombre: 'etapas.crear',
        descripcion: 'Permiso para crear etapas de proyectos',
        modulo: 'etapas',
        accion: 'crear',
      },
      {
        nombre: 'etapas.actualizar',
        descripcion: 'Permiso para actualizar etapas de proyectos',
        modulo: 'etapas',
        accion: 'actualizar',
      },
      {
        nombre: 'etapas.eliminar',
        descripcion: 'Permiso para eliminar etapas de proyectos',
        modulo: 'etapas',
        accion: 'eliminar',
      },

      // Tareas
      {
        nombre: 'tareas.leer',
        descripcion: 'Permiso para ver tareas',
        modulo: 'tareas',
        accion: 'leer',
      },
      {
        nombre: 'tareas.crear',
        descripcion: 'Permiso para crear tareas',
        modulo: 'tareas',
        accion: 'crear',
      },
      {
        nombre: 'tareas.actualizar',
        descripcion: 'Permiso para actualizar tareas',
        modulo: 'tareas',
        accion: 'actualizar',
      },
      {
        nombre: 'tareas.eliminar',
        descripcion: 'Permiso para eliminar tareas',
        modulo: 'tareas',
        accion: 'eliminar',
      },

      // Materiales
      {
        nombre: 'materiales.leer',
        descripcion: 'Permiso para ver materiales',
        modulo: 'materiales',
        accion: 'leer',
      },
      {
        nombre: 'materiales.crear',
        descripcion: 'Permiso para crear materiales',
        modulo: 'materiales',
        accion: 'crear',
      },
      {
        nombre: 'materiales.actualizar',
        descripcion: 'Permiso para actualizar materiales',
        modulo: 'materiales',
        accion: 'actualizar',
      },
      {
        nombre: 'materiales.eliminar',
        descripcion: 'Permiso para eliminar materiales',
        modulo: 'materiales',
        accion: 'eliminar',
      },

      // Proveedores
      {
        nombre: 'proveedores.leer',
        descripcion: 'Permiso para ver proveedores',
        modulo: 'proveedores',
        accion: 'leer',
      },
      {
        nombre: 'proveedores.crear',
        descripcion: 'Permiso para crear proveedores',
        modulo: 'proveedores',
        accion: 'crear',
      },
      {
        nombre: 'proveedores.actualizar',
        descripcion: 'Permiso para actualizar proveedores',
        modulo: 'proveedores',
        accion: 'actualizar',
      },
      {
        nombre: 'proveedores.eliminar',
        descripcion: 'Permiso para eliminar proveedores',
        modulo: 'proveedores',
        accion: 'eliminar',
      },

      // Roles
      {
        nombre: 'roles.leer',
        descripcion: 'Permiso para ver roles',
        modulo: 'roles',
        accion: 'leer',
      },
      {
        nombre: 'roles.crear',
        descripcion: 'Permiso para crear roles',
        modulo: 'roles',
        accion: 'crear',
      },
      {
        nombre: 'roles.actualizar',
        descripcion: 'Permiso para actualizar roles',
        modulo: 'roles',
        accion: 'actualizar',
      },
      {
        nombre: 'roles.eliminar',
        descripcion: 'Permiso para eliminar roles',
        modulo: 'roles',
        accion: 'eliminar',
      },

      // Empleados
      {
        nombre: 'empleados.leer',
        descripcion: 'Permiso para ver empleados',
        modulo: 'empleados',
        accion: 'leer',
      },
      {
        nombre: 'empleados.crear',
        descripcion: 'Permiso para crear empleados',
        modulo: 'empleados',
        accion: 'crear',
      },
      {
        nombre: 'empleados.actualizar',
        descripcion: 'Permiso para actualizar empleados',
        modulo: 'empleados',
        accion: 'actualizar',
      },
      {
        nombre: 'empleados.eliminar',
        descripcion: 'Permiso para eliminar empleados',
        modulo: 'empleados',
        accion: 'eliminar',
      },

      // Especialidades
      {
        nombre: 'especialidades.leer',
        descripcion: 'Permiso para ver especialidades',
        modulo: 'especialidades',
        accion: 'leer',
      },
      {
        nombre: 'especialidades.crear',
        descripcion: 'Permiso para crear especialidades',
        modulo: 'especialidades',
        accion: 'crear',
      },
      {
        nombre: 'especialidades.actualizar',
        descripcion: 'Permiso para actualizar especialidades',
        modulo: 'especialidades',
        accion: 'actualizar',
      },
      {
        nombre: 'especialidades.eliminar',
        descripcion: 'Permiso para eliminar especialidades',
        modulo: 'especialidades',
        accion: 'eliminar',
      },

      // Gremios
      {
        nombre: 'gremios.leer',
        descripcion: 'Permiso para ver gremios',
        modulo: 'gremios',
        accion: 'leer',
      },
      {
        nombre: 'gremios.crear',
        descripcion: 'Permiso para crear gremios',
        modulo: 'gremios',
        accion: 'crear',
      },
      {
        nombre: 'gremios.actualizar',
        descripcion: 'Permiso para actualizar gremios',
        modulo: 'gremios',
        accion: 'actualizar',
      },
      {
        nombre: 'gremios.eliminar',
        descripcion: 'Permiso para eliminar gremios',
        modulo: 'gremios',
        accion: 'eliminar',
      },

      // Permisos
      {
        nombre: 'permisos.leer',
        descripcion: 'Permiso para ver permisos',
        modulo: 'permisos',
        accion: 'leer',
      },
      {
        nombre: 'permisos.crear',
        descripcion: 'Permiso para crear permisos',
        modulo: 'permisos',
        accion: 'crear',
      },
      {
        nombre: 'permisos.actualizar',
        descripcion: 'Permiso para actualizar permisos',
        modulo: 'permisos',
        accion: 'actualizar',
      },
      {
        nombre: 'permisos.eliminar',
        descripcion: 'Permiso para eliminar permisos',
        modulo: 'permisos',
        accion: 'eliminar',
      },
    ];

    console.log('Creando permisos...');
    
    // Insertar los permisos
    for (const permiso of permisos) {
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

    // Crear rol admin y asignarle todos los permisos
    let adminRol = await prisma.rol.findFirst({
      where: { nombre: 'admin' }
    });

    if (!adminRol) {
      // Obtener todos los permisos
      const todosPermisos = await prisma.permiso.findMany();

      // Crear rol admin
      adminRol = await prisma.rol.create({
        data: {
          nombre: 'admin',
          descripcion: 'Rol de administrador con todos los permisos',
          permisos: {
            connect: todosPermisos.map(p => ({ id: p.id }))
          }
        }
      });

      console.log('Rol admin creado con todos los permisos');
    } else {
      console.log('Rol admin ya existente');
    }
    
    console.log('Proceso de creación de permisos completado');
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