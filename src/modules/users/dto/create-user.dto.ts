import { IntersectionType, PickType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { IsEmailAlreadyExist } from '../decorators/IsEmailAlreadyExist';
import { UserDetailDto } from './user-detail.dto';
import { UserDto } from './user.dto';

export class CreateUserDto extends IntersectionType(
  PickType(UserDto, ['email', 'password', 'username', 'phoneNumber'] as const),
  PickType(UserDetailDto, ['firstName', 'lastName', 'dateOfBirth'] as const),
) {
  @IsEmailAlreadyExist({ message: 'User with this email already exists' })
  email: string;

  @IsString()
  roleId: string;
}
