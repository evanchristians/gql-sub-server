import { Post } from "./Post";
import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column()
  username!: string;

  @Field(() => String)
  @Column()
  password!: string;

  @Field(() => Boolean)
  @Column({ default: true })
  active: boolean;

  @Field(() => [Post])
  @OneToMany(() => Post, post => post.user)
  posts!: Post[];
}
