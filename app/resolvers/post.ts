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
import { Post, PostModel } from "../entities/Post";
// import * as mongoose from "mongoose";
import { MyContext } from "../types";
import { COOKIE_NAME } from "../constants";
// import { UserRegisterInput } from "./types/user-register-input";
// import argon2 from "argon2";
// import { isAuth } from "../middleware/isAuth";
// import { UserRegisterInput } from "./types/user-input";

// import { Cart, CartModel } from "../entities/Cart";

@ObjectType()
class PostError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class PostResponse {
  @Field(() => [PostError], { nullable: true })
  errors?: PostError[];

  @Field(() => Post, { nullable: true })
  post?: Post;
}

@Resolver(() => PostResponse)
export class PostResolver {
  @Query(() => Post, { nullable: false })
  async post(@Arg("id") id: string) {
    return await PostModel.findById({ _id: id });
  }

  @Query(() => [Post])
  async posts() {
    return await PostModel.find();
  }

  @Mutation(() => PostResponse)
  async createPost(
    @Ctx() { models, req }: MyContext,
    // @Arg("options") { options: {text: string, body: string, userId: string }}
    @Arg("title") title: string,
    @Arg("body") body: string
    // @Arg("creatorId") creatorId: string
  ): Promise<PostResponse> {
    const { Post, PostModel } = models;
    try {
      const creatorId = req.session.userId;
      if (!title) {
        const errors = [
          {
            field: "title",
            message: "Must enter a Title.",
          },
        ];
        return { errors };
      }
      if (!body) {
        const errors = [
          {
            field: "body",
            message: "Must enter a Body.",
          },
        ];
        return { errors };
      }
      if (!creatorId) {
        const errors = [
          {
            field: "creatorId",
            message: "Must have creatorId.",
          },
        ];
        return { errors };
      }

      const newPost = {
        title,
        body,
        creatorId,
      };
      console.log("newPost");
      const addedPost = await PostModel.create(newPost);
      console.log("addedPost", addedPost);
      return { post: addedPost };
    } catch (err) {
      console.log("err from createPost", err);
      const errors = [
        {
          field: "Internal",
          message: "Something went wrong internally!",
        },
      ];
      return { errors };
    }
  }
}
