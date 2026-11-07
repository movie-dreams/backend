import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'persona', schema: 'identidad' })
export class Person {
  @PrimaryGeneratedColumn({ name: 'id_persona' })
  id: number;

  @Column({ name: 'nombres', type: 'varchar', length: 60, nullable: true })
  firstName?: string;

  @Column({ name: 'apellidos', type: 'varchar', length: 40, nullable: true })
  lastName?: string;

  @Column({ name: 'documento', type: 'varchar', length: 20, nullable: true })
  document?: string;

  @Column({ name: 'telefono', type: 'varchar', length: 15, nullable: true })
  phone?: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  birthDate?: Date;
}
