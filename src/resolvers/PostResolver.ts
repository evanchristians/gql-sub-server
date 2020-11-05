import { Post } from "../models/Post";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Subscription,
  Root,
  Args,
  PubSub,
  Publisher,
} from "type-graphql";
import { User } from "../models/User";
import { CreatePostInput } from "../inputs/CreatePostInput";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async getPosts() {
    const posts = await Post.find({ relations: ["user"] });
    return posts;
  }

  @Mutation(() => Boolean)
  async removePosts() {
    await Post.delete({});
    return true;
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("userId") userId: string,
    @Arg("data") data: CreatePostInput,
    @PubSub("POST_NOTIFICATION") publish: Publisher<Post>
  ) {
    const user = await User.findOne(userId);
    if (!user) throw new Error("User not found!");
    const post = Post.create({ ...data, user });
    await post.save();
    await publish(post);
    return post;
  }

  @Subscription({
    topics: "POST_NOTIFICATION",
  })
  newPost(@Root() postPayload: Post): Post {
    return postPayload;
  }
}
