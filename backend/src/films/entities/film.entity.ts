import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Schedule } from './schedule.entity';

const csvTransformer = {
  to: (value: string[]): string => (value ?? []).join(','),
  from: (value: string): string[] =>
    value ? value.split(',').filter((v) => v.length > 0) : [],
};

@Entity({ name: 'films' })
export class Film {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float8' })
  rating: number;

  @Column({ type: 'varchar' })
  director: string;

  @Column({ type: 'text', transformer: csvTransformer })
  tags: string[];

  @Column({ type: 'varchar' })
  image: string;

  @Column({ type: 'varchar' })
  cover: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  about: string;

  @Column({ type: 'varchar' })
  description: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film)
  schedules: Schedule[];
}
