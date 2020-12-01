import { ObjectType, Field } from "type-graphql";
// import * as mongoose from "mongoose";
import { prop as Property, getModelForClass } from "@typegoose/typegoose";

@ObjectType({ description: "The Users Model" })
export class User {
  @Field()
  // @Property()
  _id: string;

  @Field()
  @Property({ required: true, nullable: false, unique: true })
  username: string;

  @Field()
  @Property({ required: true, nullable: false, unique: true })
  email: string;

  // @Field(() => String)
  @Property({ required: true, nullable: false })
  password: string;

  @Field()
  createdAt: number;

  @Field()
  updatedAt: number;
}

export const UserModel = getModelForClass(User, {
  schemaOptions: { timestamps: true },
});
