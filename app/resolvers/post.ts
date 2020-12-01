import {
  Resolver,
  Mutation,
  Arg,
  Query,
  Ctx,
  Field,
  ObjectType,
  UseMiddleware,
  // FieldResolver,
  // Root,
} from "type-graphql";
import { Post } from "../entities/Post";
// import { ObjectId } from "mongodb";
// import * as mongoose from "mongoose";
import { MyContext } from "../types";
// import { UserRegisterInput } from "./types/user-register-input";
// import argon2 from "argon2";
import { isAuth } from "../middleware/isAuth";
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
export class PostResponse {
  @Field(() => [PostError], { nullable: true })
  errors?: PostError[];

  @Field(() => Post, { nullable: true })
  post?: Post;
}

@ObjectType()
export class PostsResponse {
  @Field(() => [PostError], { nullable: true })
  errors?: PostError[];

  @Field(() => [Post], { nullable: true })
  posts?: Post[];
}

@Resolver(() => PostResponse)
export class PostResolver {
  @Query(() => PostResponse, { nullable: false })
  @UseMiddleware(isAuth)
  async post(
    @Arg("id") id: string,
    @Ctx() { req, models }: MyContext
  ): Promise<PostResponse> {
    try {
      const { PostModel } = models;
      const post = await PostModel.findById({ _id: id });
      console.log("sessionId", req.session.userId);
      console.log("post", post);
      if (!post) {
        const errors = [
          {
            field: "No Post",
            message: "No Post Found with that id",
          },
        ];
        return { errors };
      }
      const creatorId = post.creatorId;
      console.log("postId", id);
      console.log("creatorId", creatorId);
      const filter = { $and: [{ creatorId }, { _id: id }] };
      const singlePost = await PostModel.findOne(filter);
      console.log("singlePost", singlePost);
      if (!singlePost) {
        const errors = [
          {
            field: "Not Your Post",
            message: "Sorry this post don't belong to you.",
          },
        ];
        return { errors };
      }
      return { post: singlePost };
    } catch (err) {
      console.log("err from fetching single post", err);
      const errors = [
        {
          field: "internal",
          message: "Something went wrong internally.",
        },
      ];
      return { errors };
    }
  }

  @Query(() => PostsResponse)
  async posts(@Ctx() { req, models }: MyContext): Promise<PostsResponse> {
    try {
      const { UserModel, PostModel } = models;
      console.log("req.session", req.session.userId);
      const user = await UserModel.findOne({ _id: req.session.userId });
      if (!user) {
        const errors = [
          {
            field: "noUser",
            message: "Need to Login To Get Your Posts",
          },
        ];
        return { errors };
      }
      const filter = { creatorId: user._id };
      console.log("user", user);
      const postsForUser = await PostModel.find(filter);
      console.log("postsForUser", postsForUser);
      if (!postsForUser) {
        const errors = [
          {
            field: "noPosts",
            message: "No Posts Found Four User.",
          },
        ];
        return { errors };
      }
      console.log("should be returning postsForUser");
      return { posts: postsForUser };
    } catch (err) {
      console.log("internal error on posts route");
      const errors = [
        {
          field: "internal",
          message: "Something went wrong internally, sorry",
        },
      ];
      return { errors };
    }
  }

  @Mutation(() => PostResponse)
  async createPost(
    @Ctx() { models, req }: MyContext,
    // @Arg("options") { options: {text: string, body: string, userId: string }}
    @Arg("title") title: string,
    @Arg("body") body: string
    // @Arg("creatorId") creatorId: string
  ): Promise<PostResponse> {
    const { PostModel } = models;
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
