import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddRolePermissionsDto {
  @IsNotEmpty()
  @IsString()
  roleId: string;

  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];
}
