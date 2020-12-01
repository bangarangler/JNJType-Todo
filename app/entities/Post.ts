import { ObjectType, Field } from "type-graphql";
// import * as mongoose from "mongoose";
import { prop as Property, getModelForClass } from "@typegoose/typegoose";

@ObjectType({ description: "The Post Model" })
export class Post {
  @Field()
  // @Property()
  _id: string;

  @Field()
  @Property({ required: true, nullable: false })
  creatorId: string;

  @Field()
  @Property({ required: true, nullable: false })
  title: string;

  @Field()
  @Property({ required: true, nullable: false })
  body: string;

  @Field()
  createdAt: number;

  @Field()
  updatedAt: number;
}

export const PostModel = getModelForClass(Post, {
  schemaOptions: { timestamps: true },
});
