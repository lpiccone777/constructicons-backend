-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaActividad" TIMESTAMP(3),
    "esSuperUsuario" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "modulo" TEXT NOT NULL,
    "accion" TEXT NOT NULL,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "detalles" JSONB,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proyecto" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "ubicacion" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3),
    "fechaFinEstimada" TIMESTAMP(3),
    "fechaFinReal" TIMESTAMP(3),
    "presupuestoTotal" DECIMAL(12,2) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'planificacion',
    "prioridad" TEXT NOT NULL DEFAULT 'media',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EtapaProyecto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "proyectoId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3),
    "fechaFinEstimada" TIMESTAMP(3),
    "fechaFinReal" TIMESTAMP(3),
    "presupuesto" DECIMAL(12,2) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "avance" INTEGER NOT NULL DEFAULT 0,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EtapaProyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TareaProyecto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "etapaId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3),
    "fechaFinEstimada" TIMESTAMP(3),
    "fechaFinReal" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "prioridad" TEXT NOT NULL DEFAULT 'media',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TareaProyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionProyecto" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "rol" TEXT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDesasignacion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AsignacionProyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionTarea" (
    "id" SERIAL NOT NULL,
    "tareaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDesasignacion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AsignacionTarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoProyecto" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "fechaCarga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioCargaId" INTEGER NOT NULL,

    CONSTRAINT "DocumentoProyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaProyecto" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "esPrivada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotaProyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "precioReferencia" DECIMAL(12,2) NOT NULL,
    "stockMinimo" DECIMAL(12,2),
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreComercial" TEXT,
    "tipoDocumento" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "direccion" TEXT,
    "ciudad" TEXT,
    "codigoPostal" TEXT,
    "pais" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "sitioWeb" TEXT,
    "categorias" TEXT[],
    "condicionesPago" TEXT,
    "descuento" DECIMAL(5,2),
    "observaciones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactoProveedor" (
    "id" SERIAL NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,

    CONSTRAINT "ContactoProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionMaterial" (
    "id" SERIAL NOT NULL,
    "materialId" INTEGER NOT NULL,
    "tareaId" INTEGER NOT NULL,
    "cantidad" DECIMAL(12,2) NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "observaciones" TEXT,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsignacionMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialProveedor" (
    "id" SERIAL NOT NULL,
    "materialId" INTEGER NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "tiempoEntrega" TEXT,
    "cantidadMinima" DECIMAL(12,2),
    "observaciones" TEXT,
    "esProveedorPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "codigoPostal" TEXT,
    "pais" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEgreso" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "observaciones" TEXT,
    "gremioId" INTEGER,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Especialidad" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "valorHoraBase" DECIMAL(12,2) NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Especialidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gremio" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "contactoNombre" TEXT,
    "contactoTelefono" TEXT,
    "contactoEmail" TEXT,
    "convenioVigente" TEXT,
    "fechaConvenio" TIMESTAMP(3),
    "observaciones" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gremio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpleadoEspecialidad" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "especialidadId" INTEGER NOT NULL,
    "valorHora" DECIMAL(12,2) NOT NULL,
    "fechaDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHasta" TIMESTAMP(3),
    "certificaciones" TEXT[],
    "nivelExperiencia" TEXT NOT NULL DEFAULT 'medio',
    "esPrincipal" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmpleadoEspecialidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionEmpleadoProyecto" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "rol" TEXT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDesasignacion" TIMESTAMP(3),
    "horasDiarias" DECIMAL(4,2) NOT NULL DEFAULT 8.00,
    "valorHora" DECIMAL(12,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsignacionEmpleadoProyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionEmpleadoTarea" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "tareaId" INTEGER NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDesasignacion" TIMESTAMP(3),
    "horasEstimadas" DECIMAL(6,2) NOT NULL,
    "horasRegistradas" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "valorHora" DECIMAL(12,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsignacionEmpleadoTarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionEspecialidadEtapa" (
    "id" SERIAL NOT NULL,
    "etapaId" INTEGER NOT NULL,
    "especialidadId" INTEGER NOT NULL,
    "cantidadRecursos" INTEGER NOT NULL,
    "horasEstimadas" DECIMAL(8,2) NOT NULL,
    "valorHora" DECIMAL(12,2) NOT NULL,
    "costoTotal" DECIMAL(12,2) NOT NULL,
    "observaciones" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsignacionEspecialidadEtapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionEspecialidadTarea" (
    "id" SERIAL NOT NULL,
    "tareaId" INTEGER NOT NULL,
    "especialidadId" INTEGER NOT NULL,
    "cantidadRecursos" INTEGER NOT NULL,
    "horasEstimadas" DECIMAL(8,2) NOT NULL,
    "valorHora" DECIMAL(12,2) NOT NULL,
    "costoTotal" DECIMAL(12,2) NOT NULL,
    "observaciones" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsignacionEspecialidadTarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GremioEspecialidad" (
    "id" SERIAL NOT NULL,
    "gremioId" INTEGER NOT NULL,
    "especialidadId" INTEGER NOT NULL,

    CONSTRAINT "GremioEspecialidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UsuarioRoles" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UsuarioRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RolPermisos" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RolPermisos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_nombre_key" ON "Permiso"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Proyecto_codigo_key" ON "Proyecto"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "AsignacionProyecto_proyectoId_usuarioId_rol_key" ON "AsignacionProyecto"("proyectoId", "usuarioId", "rol");

-- CreateIndex
CREATE UNIQUE INDEX "AsignacionTarea_tareaId_usuarioId_key" ON "AsignacionTarea"("tareaId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Material_codigo_key" ON "Material"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_codigo_key" ON "Proveedor"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "AsignacionMaterial_materialId_tareaId_key" ON "AsignacionMaterial"("materialId", "tareaId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialProveedor_materialId_proveedorId_key" ON "MaterialProveedor"("materialId", "proveedorId");

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_codigo_key" ON "Empleado"("codigo");

-- CreateIndex
CREATE INDEX "Empleado_codigo_idx" ON "Empleado"("codigo");

-- CreateIndex
CREATE INDEX "Empleado_estado_idx" ON "Empleado"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Especialidad_codigo_key" ON "Especialidad"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Gremio_codigo_key" ON "Gremio"("codigo");

-- CreateIndex
CREATE INDEX "EmpleadoEspecialidad_empleadoId_idx" ON "EmpleadoEspecialidad"("empleadoId");

-- CreateIndex
CREATE INDEX "EmpleadoEspecialidad_especialidadId_idx" ON "EmpleadoEspecialidad"("especialidadId");

-- CreateIndex
CREATE UNIQUE INDEX "EmpleadoEspecialidad_empleadoId_especialidadId_fechaDesde_key" ON "EmpleadoEspecialidad"("empleadoId", "especialidadId", "fechaDesde");

-- CreateIndex
CREATE INDEX "AsignacionEmpleadoProyecto_empleadoId_idx" ON "AsignacionEmpleadoProyecto"("empleadoId");

-- CreateIndex
CREATE INDEX "AsignacionEmpleadoProyecto_proyectoId_idx" ON "AsignacionEmpleadoProyecto"("proyectoId");

-- CreateIndex
CREATE UNIQUE INDEX "AsignacionEmpleadoProyecto_empleadoId_proyectoId_fechaAsign_key" ON "AsignacionEmpleadoProyecto"("empleadoId", "proyectoId", "fechaAsignacion");

-- CreateIndex
CREATE INDEX "AsignacionEmpleadoTarea_empleadoId_idx" ON "AsignacionEmpleadoTarea"("empleadoId");

-- CreateIndex
CREATE INDEX "AsignacionEmpleadoTarea_tareaId_idx" ON "AsignacionEmpleadoTarea"("tareaId");

-- CreateIndex
CREATE UNIQUE INDEX "AsignacionEmpleadoTarea_empleadoId_tareaId_fechaAsignacion_key" ON "AsignacionEmpleadoTarea"("empleadoId", "tareaId", "fechaAsignacion");

-- CreateIndex
CREATE INDEX "AsignacionEspecialidadEtapa_etapaId_idx" ON "AsignacionEspecialidadEtapa"("etapaId");

-- CreateIndex
CREATE INDEX "AsignacionEspecialidadEtapa_especialidadId_idx" ON "AsignacionEspecialidadEtapa"("especialidadId");

-- CreateIndex
CREATE UNIQUE INDEX "AsignacionEspecialidadEtapa_etapaId_especialidadId_key" ON "AsignacionEspecialidadEtapa"("etapaId", "especialidadId");

-- CreateIndex
CREATE UNIQUE INDEX "AsignacionEspecialidadTarea_tareaId_especialidadId_key" ON "AsignacionEspecialidadTarea"("tareaId", "especialidadId");

-- CreateIndex
CREATE UNIQUE INDEX "GremioEspecialidad_gremioId_especialidadId_key" ON "GremioEspecialidad"("gremioId", "especialidadId");

-- CreateIndex
CREATE INDEX "_UsuarioRoles_B_index" ON "_UsuarioRoles"("B");

-- CreateIndex
CREATE INDEX "_RolPermisos_B_index" ON "_RolPermisos"("B");

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtapaProyecto" ADD CONSTRAINT "EtapaProyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaProyecto" ADD CONSTRAINT "TareaProyecto_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "EtapaProyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionProyecto" ADD CONSTRAINT "AsignacionProyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionProyecto" ADD CONSTRAINT "AsignacionProyecto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionTarea" ADD CONSTRAINT "AsignacionTarea_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "TareaProyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionTarea" ADD CONSTRAINT "AsignacionTarea_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoProyecto" ADD CONSTRAINT "DocumentoProyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoProyecto" ADD CONSTRAINT "DocumentoProyecto_usuarioCargaId_fkey" FOREIGN KEY ("usuarioCargaId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaProyecto" ADD CONSTRAINT "NotaProyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaProyecto" ADD CONSTRAINT "NotaProyecto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactoProveedor" ADD CONSTRAINT "ContactoProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionMaterial" ADD CONSTRAINT "AsignacionMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionMaterial" ADD CONSTRAINT "AsignacionMaterial_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "TareaProyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialProveedor" ADD CONSTRAINT "MaterialProveedor_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialProveedor" ADD CONSTRAINT "MaterialProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_gremioId_fkey" FOREIGN KEY ("gremioId") REFERENCES "Gremio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpleadoEspecialidad" ADD CONSTRAINT "EmpleadoEspecialidad_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpleadoEspecialidad" ADD CONSTRAINT "EmpleadoEspecialidad_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionEmpleadoProyecto" ADD CONSTRAINT "AsignacionEmpleadoProyecto_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionEmpleadoProyecto" ADD CONSTRAINT "AsignacionEmpleadoProyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionEmpleadoTarea" ADD CONSTRAINT "AsignacionEmpleadoTarea_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionEmpleadoTarea" ADD CONSTRAINT "AsignacionEmpleadoTarea_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "TareaProyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionEspecialidadEtapa" ADD CONSTRAINT "AsignacionEspecialidadEtapa_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "EtapaProyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionEspecialidadEtapa" ADD CONSTRAINT "AsignacionEspecialidadEtapa_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionEspecialidadTarea" ADD CONSTRAINT "AsignacionEspecialidadTarea_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "TareaProyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionEspecialidadTarea" ADD CONSTRAINT "AsignacionEspecialidadTarea_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GremioEspecialidad" ADD CONSTRAINT "GremioEspecialidad_gremioId_fkey" FOREIGN KEY ("gremioId") REFERENCES "Gremio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GremioEspecialidad" ADD CONSTRAINT "GremioEspecialidad_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsuarioRoles" ADD CONSTRAINT "_UsuarioRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsuarioRoles" ADD CONSTRAINT "_UsuarioRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolPermisos" ADD CONSTRAINT "_RolPermisos_A_fkey" FOREIGN KEY ("A") REFERENCES "Permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolPermisos" ADD CONSTRAINT "_RolPermisos_B_fkey" FOREIGN KEY ("B") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
