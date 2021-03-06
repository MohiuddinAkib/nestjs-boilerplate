import { IntersectionType, PickType } from '@nestjs/mapped-types';
import { IsEmailAlreadyExist } from '../decorators/IsEmailAlreadyExist';
import { UserDetailDto } from './user-detail.dto';
import { UserDto } from './user.dto';

export class RegisterUserDto extends IntersectionType(
  PickType(UserDto, ['username', 'password', 'email'] as const),
  PickType(UserDetailDto, ['firstName', 'lastName'] as const),
) {
  @IsEmailAlreadyExist({ message: 'User with this email already exists' })
  email: string;
}
