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
CREATE TABLE "DisponibilidadEmpleado" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "horasDiarias" DECIMAL(4,2) NOT NULL DEFAULT 8.00,
    "estado" TEXT NOT NULL,
    "motivo" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisponibilidadEmpleado_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "DisponibilidadEmpleado_empleadoId_idx" ON "DisponibilidadEmpleado"("empleadoId");

-- CreateIndex
CREATE INDEX "DisponibilidadEmpleado_fechaInicio_fechaFin_idx" ON "DisponibilidadEmpleado"("fechaInicio", "fechaFin");

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

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_gremioId_fkey" FOREIGN KEY ("gremioId") REFERENCES "Gremio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpleadoEspecialidad" ADD CONSTRAINT "EmpleadoEspecialidad_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpleadoEspecialidad" ADD CONSTRAINT "EmpleadoEspecialidad_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisponibilidadEmpleado" ADD CONSTRAINT "DisponibilidadEmpleado_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionEmpleadoProyecto" ADD CONSTRAINT "AsignacionEmpleadoProyecto_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionEmpleadoProyecto" ADD CONSTRAINT "AsignacionEmpleadoProyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionEmpleadoTarea" ADD CONSTRAINT "AsignacionEmpleadoTarea_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionEmpleadoTarea" ADD CONSTRAINT "AsignacionEmpleadoTarea_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "TareaProyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
