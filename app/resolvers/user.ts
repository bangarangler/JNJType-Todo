import {
  Resolver,
  Mutation,
  Arg,
  Query,
  Ctx,
  Field,
  ObjectType,
  // UseMiddleware,
  // FieldResolver,
  // Root,
} from "type-graphql";
import { User, UserModel } from "../entities/Users";
// import * as mongoose from "mongoose";
import { MyContext } from "../types";
import { COOKIE_NAME } from "../constants";
import { UserRegisterInput } from "./types/user-register-input";
import argon2 from "argon2";
// import { isAuth } from "../middleware/isAuth";
// import { UserRegisterInput } from "./types/user-input";

// import { Cart, CartModel } from "../entities/Cart";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(() => UserResponse)
export class UserResolver {
  @Query(() => User, { nullable: false })
  async user(@Arg("id") id: string) {
    return await UserModel.findById({ _id: id });
  }

  @Query(() => [User])
  async users() {
    return await UserModel.find();
  }

  @Query(() => User, { nullable: true })
  // @UseMiddleware(isAuth)
  async me(@Ctx() { req }: MyContext) {
    if (!req?.session.userId) {
      return null;
    }
    return UserModel.findOne({ _id: req.session.userId });
  }

  @Mutation(() => UserResponse)
  async register(
    @Ctx() { models, req }: MyContext,
    @Arg("URArg")
    { username, email, password, confirmPassword }: UserRegisterInput
  ): Promise<UserResponse> {
    try {
      if (
        password.toLowerCase().trim() !== confirmPassword.toLowerCase().trim()
      ) {
        console.log("pw don't match");
        const errors = [
          {
            field: "password",
            message: "Password's Don't match!",
          },
        ];
        return { errors };
      }
      const { UserModel } = models;
      const hashedPw = await argon2.hash(password);
      console.log({ hashedPw });
      const user = await UserModel.findOne({ email }).exec();
      if (user) {
        console.log("user found");
        const errors = [
          {
            field: "username",
            message: "User already Exists!",
          },
        ];
        return { errors };
      } else {
        const newUser = {
          username,
          email,
          password: hashedPw,
        };
        const haveUser = await UserModel.create(newUser);
        req!.session.userId = haveUser._id;
        return { user: haveUser };
      }
    } catch (err) {
      console.log("err from register", err);
      const errors = [
        {
          field: "Internal",
          message: "Something went wrong internally!",
        },
      ];
      return { errors };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req, store }: MyContext
  ): Promise<UserResponse> {
    try {
      console.log("store", store);
      const user = await UserModel.findOne(
        usernameOrEmail.includes("@")
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail }
      );
      if (!user) {
        return {
          errors: [
            {
              field: "usernameOrEmail",
              message: "Username don't exist",
            },
          ],
        };
      }
      const valid = await argon2.verify(user.password, password);
      if (!valid) {
        return {
          errors: [
            {
              field: "password",
              message: "Bad Credentials",
            },
          ],
        };
      }
      req!.session.userId = user._id;
      return { user };
    } catch (err) {
      console.log("err from login catch", err);
      const errors = [
        {
          field: "Internal",
          message: "Something Went Wrong Internally",
        },
      ];
      return { errors };
    }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req?.session.destroy((err) => {
        res?.clearCookie(COOKIE_NAME);
        if (err) {
          console.log("err from logout promise: ", err);
          resolve(false);
        }
        resolve(true);
      })
    );
  }
}
