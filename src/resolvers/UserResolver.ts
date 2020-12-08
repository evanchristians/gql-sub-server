import bcrypt from "bcrypt";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Context } from "../context";
import { LoginInput } from "../inputs/LoginInput";
import { RegisterInput } from "../inputs/RegisterInput";
import { UpdateUserInput } from "../inputs/UpdateUserInput";
import { auth } from "../lib/auth";
import { User } from "../models/User";
import { UserResponse } from "../types/UserResponse";

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async getUsers() {
    const users = await User.find();
    return users;
  }

  @Query(() => UserResponse, { nullable: true })
  me(@Ctx() { userId }: Context) {
    if (!userId) {
      return null;
    }

    const user = User.findOne(userId);

    if (!user)
      return {
        errors: [
          {
            field: "username",
            message: "User not found!",
          },
        ],
      };

    return { user };
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

    return { user };
  }

  @Mutation(() => UserResponse)
  async register(@Arg("data") data: RegisterInput, @Ctx() { res }: Context) {
    const existingUser = await User.findOne({
      where: { username: data.username },
    });

    if (existingUser)
      return {
        errors: [
          {
            field: "username",
            message: "Username already taken!",
          },
        ],
      };

    const hash = bcrypt.hashSync(data.password, 12);
    data.password = hash;
    const user = User.create(data);
    await user.save();
    const { token, refreshToken } = auth(user);
    res.cookie("token", token, { httpOnly: true });
    res.cookie("refresh-token", refreshToken, { httpOnly: true });

    return { user };
  }

  @Mutation(() => User)
  async updateUser(@Arg("id") id: string, @Arg("data") data: UpdateUserInput) {
    const user = await User.findOne(id);
    if (!user) throw new Error("User not found!");
    Object.assign(user, data);
    await user.save();
    return user;
  }

  @Mutation(() => UserResponse)
  async login(@Arg("data") data: LoginInput, @Ctx() { res }: Context) {
    const user = await User.findOne({ where: { username: data.username } });

    if (!user)
      return {
        errors: [
          {
            field: "username",
            message: "Username not found!",
          },
        ],
      };

    if (!bcrypt.compareSync(data.password, user.password))
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password!",
          },
        ],
      };

    const { token, refreshToken } = auth(user);
    console.log(
      token,
      res.cookie("token", token, { httpOnly: true }),
      refreshToken,
      res.cookie("refresh-token", refreshToken, { httpOnly: true })
    );

    return { user };
  }

  @Mutation(() => Boolean)
  async invalidateTokens(@Ctx() { userId }: Context) {
    if (!userId) return false;
    await User.update(userId, { count: () => "count + 1" });
    return true;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res, userId }: Context) {
    res.clearCookie("token");
    res.clearCookie("refresh-token");
    if (userId) {
      userId = undefined;
    }
    return true;
  }
}
