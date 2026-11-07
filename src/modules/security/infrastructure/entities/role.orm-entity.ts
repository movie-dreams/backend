import { Entity, PrimaryGeneratedColumn, Column, OneToMany, type Relation } from 'typeorm';
import { UserRole as UserRoleOrmEntity } from './user-role.orm-entity.js';

@Entity({ name: 'rol', schema: 'seguridad' })
export class Role {
  @PrimaryGeneratedColumn({ name: 'id_rol' })
  id: number;

  @Column({ name: 'rol', type: 'varchar', length: 30 })
  name: string;

  @OneToMany(() => UserRoleOrmEntity, (userRole) => userRole.role)
  userRoles: Relation<UserRoleOrmEntity[]>;
}
