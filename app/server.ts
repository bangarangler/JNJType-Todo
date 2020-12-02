import * as dotenv from "dotenv";
dotenv.config();
import { ApolloServer } from "apollo-server-express";
import Express from "express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { connect } from "mongoose";
import { MyContext } from "./types";
import { models } from "./entities/index";
import session from "express-session";
import cors from "cors";
const MongoDBStore = require("connect-mongodb-session")(session);
import { COOKIE_NAME, __dev__, __prod__ } from "./constants";
// import { typedInputs } from "./resolvers/types/index";

// resolvers
import { UserResolver } from "./resolvers/user";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { CommentResolver } from "./resolvers/comment";

const main = async () => {
  try {
    const schema = await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostResolver, CommentResolver],
      emitSchemaFile: true,
      validate: false,
    });

    console.log(process.env.MONGO_USER, process.env.MONGO_PW);
    const mongoose = await connect(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@jnjtype-todo.01wb5.mongodb.net/type-todo?retryWrites=true&w=majority`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    mongoose.connection;
    const app = Express();
    const store = await new MongoDBStore({
      uri: process.env.MONGO_URI,
      collection: "session-details",
    });
    if (!store) throw new Error("error creating store");
    const whitelist = [
      "https://studio.apollographql.com",
      "http://localhost:3000",
    ];
    const corsOptions = {
      origin: function (origin: any, callback: any) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      // origin: whitelist,
      credentials: true,
    };
    app.use(cors(corsOptions));

    const server = new ApolloServer({
      schema,
      context: ({ req, res }): MyContext => ({ req, res, models, store }),
      playground: {
        settings: {
          "request.credentials": "include",
        },
      },
    });

    app.use(
      session({
        store: store,
        name: COOKIE_NAME,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
          httpOnly: true,
          // sameSite: "lax",
          sameSite: __dev__,
          // sameSite: "None; Secure",
          secure: __prod__,
        },
        saveUninitialized: false,
        resave: false,
        secret: process.env.COOKIE_SECRET!,
      })
    );
    server.applyMiddleware({ app, cors: false });
    app.listen({ port: process.env.PORT || 5000 }, () => {
      console.log(
        `🚀 Server ready and listening at ==> http://localhost:4000${server.graphqlPath}`
      );
    });
  } catch (err) {
    console.log(`Err in main`, err);
  }
};

main();
