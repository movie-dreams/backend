import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { Person as PersonOrmEntity } from '../../../identity/infrastructure/entities/person.orm-entity.js';
import { UserRole as UserRoleOrmEntity } from './user-role.orm-entity.js';

@Entity({ name: 'usuario', schema: 'seguridad' })
export class User {
  @PrimaryColumn({ name: 'id_persona' })
  id: number;

  @Column({ name: 'usuario', type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ name: 'contrasena', type: 'varchar', length: 255 })
  password: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp' })
  createdAt: Date;

  @OneToOne(() => PersonOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_persona' })
  person: PersonOrmEntity;

  @OneToMany(() => UserRoleOrmEntity, (userRole) => userRole.user)
  userRoles: Relation<UserRoleOrmEntity[]>;
}
