import { ObjectType, Field } from "type-graphql";
import { prop as Property, getModelForClass } from "@typegoose/typegoose";

// import { Ref } from "../types";
// import { Cart } from "./Cart";

@ObjectType({ description: "The Hello Model" })
export class Hello {
  // @Field(() => ID)
  // id: number;

  @Field()
  @Property({ required: true })
  hello: String;
}

export const HelloModel = getModelForClass(Hello);
