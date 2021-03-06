import {
  Resolver,
  Mutation,
  Subscription,
  Arg,
  Query,
  Ctx,
  Field,
  ObjectType,
  UseMiddleware,
  PubSub,
} from "type-graphql";
import { Comment } from "../entities/Comment";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { GeneralError, InputError } from "./types/Error";
import { catchTypeChecker } from "../utils/catchTypeChecker";

// @ObjectType()
// class SingleError {
//   @Field()
//   message: string;
// }

// @ObjectType()
// class CommentError {
//   @Field()
//   field: string;
//   @Field()
//   message: string;
// }

@ObjectType()
export class CommentResponse {
  @Field(() => [InputError], { nullable: true })
  inputErrors?: InputError[];

  @Field(() => GeneralError, { nullable: true })
  error?: GeneralError;

  @Field(() => Comment, { nullable: true })
  comment?: Comment;
}

@ObjectType()
export class CommentsResponse {
  @Field(() => GeneralError, { nullable: true })
  error?: GeneralError;

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];
}

@Resolver()
export class CommentResolver {
  @Query(() => CommentResponse, { nullable: false })
  @UseMiddleware(isAuth)
  async comment(
    @Arg("id") id: string,
    @Ctx() { models }: MyContext
  ): Promise<CommentResponse> {
    const { CommentModel } = models;
    try {
      if (!id) throw "missing argument";

      const res = await CommentModel.findOne({ _id: id });

      if (!res) throw "couldn't find comment, sorry!";

      return {
        comment: res,
      };
    } catch (error) {
      return { error };
    }
  }

  @Mutation(() => CommentResponse, { nullable: false })
  @UseMiddleware(isAuth)
  async createComment(
    @Arg("postId") postId: string,
    @Arg("body") body: string,
    @PubSub("NEW_COMMENT") publish: any,
    @Ctx() { req, models }: MyContext
  ): Promise<CommentResponse> {
    const { CommentModel, PostModel } = models;
    const errors = [];
    try {
      if (!body || body === "")
        errors.push({ field: "comment", message: "empty" });
      console.log("postId :>> ", postId);
      if (!postId || postId === "" || !req?.session.userId)
        errors.push({ field: "args", message: "missing arguments" });
      if (errors.length > 0) throw [...errors];

      const post = await PostModel.findOne({ _id: postId });

      console.log("post :>> ", post);
      if (!post) throw "no post found";
      const newComment = {
        body,
        postId,
        creatorId: req?.session.userId,
      };
      const res = await CommentModel.create(newComment);

      if (!res) throw "couldn't add to DB";

      await publish({ newComment: res });
      return { comment: res };
    } catch (error) {
      console.log("error :>> ", error);
      return catchTypeChecker(error);
    }
  }

  @Subscription(() => String, {
    topics: ["MESSAGES", "NEW_COMMENT"],
    // subscribe: (parent, args, ctx) => {
    //   console.log("ctx", ctx);
    //   return "test"
    // return pubSub.publish.asyncIterator(["NEW_COMMENT"]);
    // asyncIterator(["NEW_COMMENT"]);
    // },
  })
  // newNotification(): Notification {
  //   return {
  //
  //   }
  // }
  async newComment(@Ctx() { connection }: MyContext) {
    // return "stuff";
    return connection?.pubsub.asyncIterator(["NEW_COMMENT"]);
  }
  @Query(() => String)
  async hello(@Ctx() {}: MyContext) {
    // await connection?.pubsub.publish("MESSAGES");
    return "HELLO WORLD";
  }
}
