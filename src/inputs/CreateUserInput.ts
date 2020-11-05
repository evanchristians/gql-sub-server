import { Field, InputType } from "type-graphql";

@InputType()
export class CreateUserInput {
  @Field()
  username: string;

  @Field()
  password: string;
}
