import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Transactional } from 'typeorm-transactional';
import { UserRepository } from '../../../security/domain/repositories/user.repository.js';
import { UserRoleRepository } from '../../../security/domain/repositories/user-role.repository.js';
import { RoleRepository } from '../../../security/domain/repositories/role.repository.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterUserDto } from '../dto/register-user.dto.js';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface.js';
import { normalizeIdentifier } from '../../../../common/utils/identifier.utils.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly roleRepository: RoleRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ token: string }> {
    const identifier = normalizeIdentifier(dto.username);
    const user = await this.userRepository.findByUsernameInsensitive(identifier);

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales no válidas');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales no válidas');
    }

    const roles = await this.getActiveRolesForUser(user.id);

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      roles,
    };

    return { token: this.jwtService.sign(payload) };
  }

  @Transactional()
  async registerUserWithRole(
    dto: RegisterUserDto,
    roleName: string,
  ): Promise<void> {
    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      throw new NotFoundException(`El rol '${roleName}' no existe`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.save({
      id: dto.personId,
      username: dto.username,
      password: hashedPassword,
    });

    await this.userRoleRepository.save({
      userId: user.id,
      roleId: role.id,
      status: true,
    });
  }

  async getActiveRolesForUser(userId: number): Promise<string[]> {
    const userRoles = await this.userRoleRepository.findByUserId(userId);
    return userRoles
      .filter((userRole) => userRole.status && userRole.role)
      .map((userRole) => userRole.role!.name);
  }

  validatePayload(payload: JwtPayload): JwtPayload {
    return payload;
  }
}