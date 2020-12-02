/// <reference types="node" />
// import { ObjectId } from "mongodb";
// export type Ref<T> = T | ObjectId;
import { PubSub } from "apollo-server-express";
import { Request, Response } from "express";
import { ExecutionParams } from "subscriptions-transport-ws";
// import { PubSub } from "apollo-server-express";

interface SessionData {
  userId?: string;
}

interface AddPubSub extends ExecutionParams {
  pubsub?: any;
}

export type MyContext = {
  req?: Request & { session: SessionData };
  res?: Response;
  models?: any;
  store?: any;
  connection?: AddPubSub;
  pubsub?: PubSub;
};
