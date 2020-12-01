import { Resolver, Mutation, Arg, Query } from "type-graphql";
// import { User, UserModel } from "../entities/Users";
// import { UserInput } from "./types/user-input";
import { Hello } from "../entities/Hello";
// import { Cart, CartModel } from "../entities/Cart";

@Resolver()
export class HelloResolver {
  @Query(() => String, { nullable: false })
  async hello() {
    // return await UserModel.findById({ _id: id });
    return "Hello World!";
  }

  // @Query(() => [User])
  // async returnAllUsers() {
  //   return await UserModel.find();
  // }

  @Mutation(() => Hello)
  async saySomething(@Arg("said") said: string) {
    return `this was said: ${said}`;
  }
  // async createUser(
  //   @Arg("data") { username, email, cart_id }: UserInput
  // ): Promise<User> {
  //   const user = (
  //     await UserModel.create({
  //       username,
  //       email,
  //       cart_id,
  //     })
  //   ).save();
  //   return user;
  // }

  // @Mutation(() => Boolean)
  // async deleteUser(@Arg("id") id: string) {
  //   await UserModel.deleteOne({ id });
  //   return true;
  // }

  // @FieldResolver((_type) => Cart)
  // async cart(@Root() user: User): Promise<Cart> {
  //   console.log(user, "userr!");
  //   return (await CartModel.findById(user._doc.cart_id))!;
  // }
}
