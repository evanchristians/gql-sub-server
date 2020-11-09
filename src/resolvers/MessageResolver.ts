import {
  Arg,
  Mutation,
  Publisher,
  PubSub,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { SendMessageInput } from "../inputs/SendMessageInput";
import { Message } from "../models/Message";

@Resolver()
export class MessageResolver {
  @Query(() => [Message])
  async messages() {
    const messages = await Message.find({order: {createdAt: "ASC"}});
    return messages;
  }

  @Mutation(() => Boolean)
  async removeMessages() {
    await Message.delete({});
    return true;
  }

  @Mutation(() => Message)
  async sendMessage(
    @Arg("data") data: SendMessageInput,
    @PubSub("NEWMESSAGE") publish: Publisher<Message>
  ) {
    const message = Message.create(data);
    await message.save();
    await publish(message);
    return message;
  }

  @Subscription({
    topics: "NEWMESSAGE",
  })
  newMessage(@Root() messagePayload: Message): Message {
    return messagePayload;
  }
}
