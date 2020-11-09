import bcrypt from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { UserResponse } from "../types/UserResponse";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Context } from "../context";
import { LoginInput } from "../inputs/LoginInput";
import { RegisterInput } from "../inputs/RegisterInput";
import { UpdateUserInput } from "../inputs/UpdateUserInput";
import { User } from "../models/User";

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async getUsers() {
    const users = await User.find();
    return users;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: Context) {
    const token: any = verify(req.cookies["token"], "poggers");
    if (!token?.userId) {
      throw new Error("Invalid Token");
    }
    const user = User.findOne(token.userId);
    if (!user) throw new Error("User not found!");
    return user;
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

    const token = sign({ userId: user.id }, "poggers", { expiresIn: "2h" });
    res.cookie("token", token);

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

    const token = sign({ userId: user.id }, "poggers", { expiresIn: "2h" });

    res.cookie("token", token);
    return { user };
  }
}
