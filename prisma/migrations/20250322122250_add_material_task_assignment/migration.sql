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

-- CreateIndex
CREATE UNIQUE INDEX "AsignacionMaterial_materialId_tareaId_key" ON "AsignacionMaterial"("materialId", "tareaId");

-- AddForeignKey
ALTER TABLE "AsignacionMaterial" ADD CONSTRAINT "AsignacionMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionMaterial" ADD CONSTRAINT "AsignacionMaterial_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "TareaProyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
