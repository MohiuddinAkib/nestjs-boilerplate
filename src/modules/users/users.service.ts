import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare } from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { CreateFileDto, GetFileDto } from '../files/dto';
import { RolesService } from './../roles/roles.service';
import { FilesService } from '../files/files.service';
import {
  RegisterUserDto,
  GetUserDto,
  LoginUserDto,
  CreateUserDto,
} from './dto';
import { UserDetailEntity } from './entities/user-detail.entity';
import { UserStatus } from './enums';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _filesService: FilesService,
    private readonly _rolesService: RolesService,
    private readonly _logger: Logger,
  ) {
    this._logger.setContext('UsersService');
  }

  async getAll(): Promise<GetUserDto[]> {
    this._logger.log('Request to fetch all users');
    const users = await this._userRepository.find();
    return users.map((user) => plainToClass(GetUserDto, user));
  }

  async getById(id: string): Promise<GetUserDto> {
    this._logger.log(`Request to fetch user by id: ${id}`);
    const user = await this._userRepository.findOne(id);

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    return plainToClass(GetUserDto, user);
  }

  async getByUsername(username: string): Promise<GetUserDto> {
    this._logger.log(`Request to fetch user by username: ${username}`);
    const user = await this._userRepository.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    return plainToClass(GetUserDto, user);
  }

  async getByLoginCredentials({
    email,
    password,
  }: LoginUserDto): Promise<GetUserDto> {
    this._logger.log('Request to fetch user by login credentials.');

    // Checks if user exists.
    const user = await this._userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Username incorrect.');
    }

    // Checks if user password is correct.
    const validPassword = await compare(password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Password incorrect.');
    }

    return plainToClass(GetUserDto, user);
  }

  async register(registerUserDto: RegisterUserDto): Promise<GetUserDto> {
    this._logger.log(`Request to create a new user`);
    const { firstName, lastName } = registerUserDto;

    const user = this._userRepository.create(registerUserDto);

    const userDetail = new UserDetailEntity();
    userDetail.firstName = firstName;
    userDetail.lastName = lastName;
    user.details = userDetail;

    await user.save();

    return plainToClass(GetUserDto, user);
  }

  async create(createUserDto: CreateUserDto): Promise<GetUserDto> {
    this._logger.log(`Request to create a new user`);
    const { firstName, lastName, dateOfBirth, roleId, ...rest } = createUserDto;

    const user = this._userRepository.create(rest);

    const userDetail = new UserDetailEntity();
    userDetail.firstName = firstName;
    userDetail.lastName = lastName;
    userDetail.dateOfBirth = dateOfBirth;
    user.details = userDetail;

    const role = await this._rolesService.fetchById(roleId);

    user.roles.push(role);

    await user.save();

    return plainToClass(GetUserDto, user);
  }

  async uploadFile(
    userId: string,
    createFileDto: CreateFileDto,
  ): Promise<GetFileDto> {
    this._logger.log(`Request to upload user file`);

    // Validates if user exists.
    const user = await this._userRepository.findOne(userId, {
      where: { status: UserStatus.Active },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validates if the user already has the file.
    const currentFile = user.files.find(
      (file) => file.group === createFileDto.group,
    );

    if (currentFile) {
      await this._filesService.delete(currentFile.id);
    }

    await user.reload();

    // Updates user's file.
    const file = await this._filesService.create(createFileDto);
    user.files.push(file);
    await user.save();
    return plainToClass(GetFileDto, file);
  }
}
