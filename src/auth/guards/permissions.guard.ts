import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermisosService } from '../../permisos/permisos.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permisosService: PermisosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    // Si el usuario es superusuario, permitir acceso
    if (user.esSuperUsuario) {
      return true;
    }

    const [modulo, accion] = requiredPermissions[0].split('.');
    const hasPermission = await this.permisosService.verificarPermiso(
      user.id,
      modulo,
      accion,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `No tiene permisos para ${accion} ${modulo}`,
      );
    }

    return true;
  }
}
