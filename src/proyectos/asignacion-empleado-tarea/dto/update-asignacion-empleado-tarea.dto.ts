import { PartialType } from '@nestjs/swagger';
import { CreateAsignacionEmpleadoTareaDto } from './create-asignacion-empleado-tarea.dto';

export class UpdateAsignacionEmpleadoTareaDto extends PartialType(CreateAsignacionEmpleadoTareaDto) {}
