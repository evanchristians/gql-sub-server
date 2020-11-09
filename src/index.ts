import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import { execute, subscribe } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { createServer } from "http";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { buildSchema, GraphQLISODateTime } from "type-graphql";
import { createConnection } from "typeorm";
import { PORT } from "./constants";
import { MessageResolver } from "./resolvers/MessageResolver";
import { UserResolver } from "./resolvers/UserResolver";

const App = async () => {
  await createConnection();
  const app = express();
  app.use(cookieParser());
  app.use("/graphql", bodyParser.json());

  const schema = await buildSchema({
    resolvers: [UserResolver, MessageResolver],
    scalarsMap: [{ type: Date, scalar: GraphQLISODateTime }],
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res }),
    subscriptions: {
      path: "/subscriptions",
    },
  });

  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: "http://localhost:3000",
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
