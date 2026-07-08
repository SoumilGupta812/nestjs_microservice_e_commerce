import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth-guard';
import { AuthController } from './auth.controller';

@Module({
  imports: [UsersModule],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, //registering the JwtAuthGuard as a global guard for the application
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
