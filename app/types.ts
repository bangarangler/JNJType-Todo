// import { ObjectId } from "mongodb";
// export type Ref<T> = T | ObjectId;
import { Request, Response } from "express";

interface SessionData {
  userId?: string;
}

export type MyContext = {
  req: Request & { session: SessionData };
  res: Response;
  models: any;
  store: any;
};
