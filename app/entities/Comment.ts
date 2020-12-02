import { ObjectType, Field } from "type-graphql";
// import * as mongoose from "mongoose";
import { prop as Property, getModelForClass } from "@typegoose/typegoose";

@ObjectType({ description: "The comments model" })
export class Comment {
  @Field()
  _id?: string;

  @Field()
  @Property({ required: true, nullable: false })
  creatorId: string;

  @Field()
  @Property({ required: true, nullable: false })
  postId: string;

  @Field()
  @Property({ required: true, nullable: false })
  body: string;

  @Field()
  createdAt?: number;

  @Field()
  updatedAt?: number;
}

export const CommentModel = getModelForClass(Comment, {
  schemaOptions: { timestamps: true },
});
