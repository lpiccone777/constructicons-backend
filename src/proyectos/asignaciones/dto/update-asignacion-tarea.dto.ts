import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateAsignacionTareaDto {
  @ApiPropertyOptional({
    example: '2025-05-30',
    description: 'Fecha de desasignación del usuario',
  })
  @IsDateString()
  @IsOptional()
  fechaDesasignacion?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si la asignación está activa',
  })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
