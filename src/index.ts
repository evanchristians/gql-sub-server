import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import { execute, subscribe } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { createServer } from "http";
import { verify } from "jsonwebtoken";
import "reflect-metadata";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { buildSchema, GraphQLISODateTime } from "type-graphql";
import { createConnection } from "typeorm";
import {
  // CLIENT_URI,
  PORT,
  REFRESH_TOKEN_SECRET,
  TOKEN_SECRET,
  TYPE_ORM_CONFIG,
} from "./constants";
import { auth } from "./lib/auth";
import { User } from "./models/User";
import { MessageResolver } from "./resolvers/MessageResolver";
import { UserResolver } from "./resolvers/UserResolver";

const App = async () => {
  const typeOrmConfig = await TYPE_ORM_CONFIG;
  await createConnection(typeOrmConfig);
  const app = express();
  app.use(cookieParser());
  app.use("/graphql", bodyParser.json());

  const schema = await buildSchema({
    resolvers: [UserResolver, MessageResolver],
    scalarsMap: [{ type: Date, scalar: GraphQLISODateTime }],
  });

  const apolloServer = new ApolloServer({
    schema,
    context: async ({ req, res }: any) => {
      const token = req.cookies["token"];
      const refreshToken = req.cookies["refresh-token"];

      if (!refreshToken && !token) {
        return { req, res };
      }

      try {
        const data = verify(token, TOKEN_SECRET) as any;

        return { userId: data.userId, req, res };
      } catch {}

      if (!refreshToken) {
        return { req, res };
      }

      let data;

      try {
        data = verify(refreshToken, REFRESH_TOKEN_SECRET) as any;
      } catch {
        return { req, res };
      }

      const user = await User.findOne(data.userid);
      if (!user || user.count !== data.count) {
        return { req, res };
      }

      const tokens = auth(user);

      res.cookie("token", tokens.token);
      res.cookie("refresh-token", tokens.refreshToken);

      return { userId: user.id, req, res };
    },
    subscriptions: {
      path: "/subscriptions",
    },
  });

  apolloServer.applyMiddleware({
    app,
    cors: {
      credentials: true,
    },
  });
  new PubSub();

  const server = createServer(app);
  server.listen(PORT, () => {
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server,
        path: "/subscriptions",
      }
    );
    console.log("server running");
  });
};

App();
