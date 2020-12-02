import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class GeneralError {
  @Field()
  message: string;
}

@ObjectType()
export class InputError {
  @Field()
  field: string;
  @Field()
  message: string;
}
