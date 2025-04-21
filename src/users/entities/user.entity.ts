import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Profile } from 'src/profiles/entities/profile.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
@Expose()
@Index(['username', 'email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date; 

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true, eager: true })
  @Expose()
  profile: Profile;
}
