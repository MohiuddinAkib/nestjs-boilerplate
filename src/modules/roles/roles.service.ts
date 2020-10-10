import { AdvanceQuery } from '@lib/dto/advance-result';
import { AdvanceResult } from '@lib/interfaces/advance-result';
import { mapQuery } from '@lib/utils/advance-result';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { GetRoleDto } from './dto/get-role.dto';
import { RoleRepository } from './role.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly _roleRepository: RoleRepository,
    private readonly _logger: Logger,
  ) {
    this._logger.setContext('RolesService');
  }

  async getAll(
    advanceQuery: AdvanceQuery,
  ): Promise<AdvanceResult<GetRoleDto[]>> {
    this._logger.log('Request to fetch all roles.');

    try {
      const [result, total] = await this._roleRepository.findAndCount(
        mapQuery(advanceQuery),
      );

      return {
        data: result.map(role => plainToClass(GetRoleDto, role)),
        meta: { count: total },
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
