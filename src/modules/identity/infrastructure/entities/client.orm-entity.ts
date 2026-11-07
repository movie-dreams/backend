import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Person as PersonOrmEntity } from './person.orm-entity.js';

@Entity({ name: 'cliente', schema: 'identidad' })
export class Client {
  @PrimaryColumn({ name: 'id_persona' })
  id: number;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamp' })
  registrationDate: Date;

  @Column({ name: 'activo', type: 'boolean', default: true })
  isActive: boolean;

  @OneToOne(() => PersonOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_persona' })
  person: PersonOrmEntity;
}
