import { forwardRef, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PermissionRepository } from '../permissions/permission.repository';
import { RoleRepository } from './role.repository';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleRepository, PermissionRepository]),
    forwardRef(() => AuthModule),
  ],
  controllers: [RolesController],
  providers: [RolesService, Logger],
  exports: [RolesService]
})
export class RolesModule {
}
