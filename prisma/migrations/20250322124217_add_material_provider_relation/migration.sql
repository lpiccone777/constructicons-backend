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

-- CreateIndex
CREATE UNIQUE INDEX "MaterialProveedor_materialId_proveedorId_key" ON "MaterialProveedor"("materialId", "proveedorId");

-- AddForeignKey
ALTER TABLE "MaterialProveedor" ADD CONSTRAINT "MaterialProveedor_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialProveedor" ADD CONSTRAINT "MaterialProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
