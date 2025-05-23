// src/modules/users/entities/user.entity.ts
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType({ description: 'Represents a user' }) // GraphQL Object Type
@Entity() // TypeORM Entity, tên bảng là 'users'
export class User {
  @PrimaryGeneratedColumn('uuid') // Sử dụng UUID cho ID
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field(() => String)
  email: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  username?: string;

  // Không expose password ra GraphQL API
  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  lastName?: string;

  @Column({ default: true })
  @Field(() => Boolean)
  isActive: boolean;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  // Ví dụ về một field tính toán hoặc custom (không lưu trong DB)
  @Field(() => String, { description: 'Full name of the user' })
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
}
