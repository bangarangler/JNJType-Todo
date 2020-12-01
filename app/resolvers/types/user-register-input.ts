import { InputType, Field } from "type-graphql";
import { Length, IsEmail } from "class-validator";
import { User } from "../../entities/Users";
// import { ObjectId } from "mongodb";

@InputType()
export class UserRegisterInput implements Partial<User> {
  @Field()
  @Length(1, 255)
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;

  @Field()
  confirmPassword: string;
}
