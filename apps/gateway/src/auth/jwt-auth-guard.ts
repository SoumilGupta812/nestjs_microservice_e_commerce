import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import { REQUIRE_ADMIN_KEY } from './admin.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';
    if (!token) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const identifyAuthUser =
      await this.authService.verifyAndBuildContext(token);
    const dbUser = await this.usersService.upsertAuthUser({
      clerkUserId: identifyAuthUser.clerkUserId,
      email: identifyAuthUser.email,
      name: identifyAuthUser.name,
    });

    const user = {
      ...identifyAuthUser,
      role: dbUser.role,
    };
    request.user = user;
    const requiredRole = this.reflector.getAllAndOverride<string>(
      REQUIRE_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiredRole === 'admin' && user.role !== requiredRole) {
      throw new UnauthorizedException('Access denied');
    }
    return true;
  }
}
