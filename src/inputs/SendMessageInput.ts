import { Field, InputType } from "type-graphql";

@InputType()
export class SendMessageInput {
  @Field()
  sender: string;

  @Field()
  text: string;
}
