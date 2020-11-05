import bcrypt from "bcrypt";
import { LoginUserInput } from "../inputs/LoginUserInput";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { CreateUserInput } from "../inputs/CreateUserInput";
import { UpdateUserInput } from "../inputs/UpdateUserInput";
import { User } from "../models/User";

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async getUsers() {
    const users = await User.find({ relations: ["posts"] });
    return users;
  }

  @Mutation(() => Boolean)
  async removeUsers() {
    await User.delete({});
    return true;
  }
  @Query(() => User)
  async getUser(@Arg("id") id: string) {
    const user = await User.findOne(id);
    if (!user) throw new Error("User not found");

    return user;
  }

  @Mutation(() => User)
  async createUser(@Arg("data") data: CreateUserInput) {
    const hash = bcrypt.hashSync(data.password, 12);
    data.password = hash;
    const user = User.create(data);
    await user.save();
    return user;
  }

  @Mutation(() => User)
  async updateUser(@Arg("id") id: string, @Arg("data") data: UpdateUserInput) {
    const user = await User.findOne(id);

    if (!user) throw new Error("User not found!");

    Object.assign(user, data);

    await user.save();

    return user;
  }

  @Mutation(() => User)
  async loginUser(@Arg("data") data: LoginUserInput) {
    const user = await User.findOne({ where: { username: data.username } });

    if (!user) throw new Error("Username not found!");

    if (!bcrypt.compareSync(data.password, user.password))
      throw new Error("Incorrect Password!");

    return user;
  }
}
