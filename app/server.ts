import * as dotenv from "dotenv";
dotenv.config();
import { ApolloServer, PubSub } from "apollo-server-express";
import bodyParser from "body-parser";
// import http from "http";
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
    const pubsub = new PubSub();
    const schema = await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostResolver, CommentResolver],
      emitSchemaFile: true,
      pubSub: pubsub,
      validate: false,
    });

    console.log(process.env.MONGO_USER, process.env.MONGO_PW);
    const mongoose = await connect(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@jnjtype-todo.01wb5.mongodb.net/type-todo?retryWrites=true&w=majority`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    mongoose.connection;
    // const app = Express();
    const store = await new MongoDBStore({
      uri: process.env.MONGO_URI,
      collection: "session-details",
    });
    if (!store) throw new Error("error creating store");
    const whitelist = [
      "https://studio.apollographql.com",
      "http://localhost:3000",
      "http://localhost:4000/graphql",
      "ws://localhost:4000/graphql",
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
    const app = Express();
    // app.use(cors());
    app.use(cors(corsOptions));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // const pubsub = new PubSub();

    const server = new ApolloServer({
      schema,
      context: ({ req, res }): MyContext => {
        // if (connection) {
        // console.log("in connection if block");
        // connection.pubsub = pubsub;
        // connection.pubsub = pubsub;
        // return { connection } as any;
        // } else {
        return { req, res, models, store };
        // }
      },
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
    // const httpServer = http.createServer(app);
    // server.installSubscriptionHandlers(httpServer);
    // try {
    //   const port = process.env.PORT || 5000;
    //   httpServer.listen(port, () => {
    //     console.log(`Server running on port ${port}`);
    //     console.log(
    //       `Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`
    //     );
    //   });
    // } catch (err) {
    //   console.log("err", err);
    // }
    // const {url} = await server.listen(process.env.PORT || 5000)
    app.listen({ port: process.env.PORT || 5000 }, () => {
      console.log(
        `🚀 Server ready and listening at ==> http://localhost:4000${server.graphqlPath}`
        // `🚀 Server ready and listening at ==> ${url}`
      );
    });
  } catch (err) {
    console.log(`Err in main`, err);
  }
};

main();
