import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { User as UserOrmEntity } from './user.orm-entity.js';
import { Role as RoleOrmEntity } from './role.orm-entity.js';

@Entity({ name: 'rol_usuario', schema: 'seguridad' })
export class UserRole {
  @PrimaryGeneratedColumn({ name: 'id_rol_usuario', type: 'bigint' })
  id: string;

  @Column({ name: 'id_usuario' })
  userId: number;

  @Column({ name: 'id_rol' })
  roleId: number;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'estado', type: 'boolean', default: true })
  status: boolean;

  @ManyToOne(() => UserOrmEntity, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  user: Relation<UserOrmEntity>;

  @ManyToOne(() => RoleOrmEntity, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_rol' })
  role: Relation<RoleOrmEntity>;
}
