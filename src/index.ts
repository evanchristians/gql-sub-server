import "class-validator";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { PORT } from "./constants";
import { UserResolver } from "./resolvers/UserResolver";
import { PostResolver } from "./resolvers/PostResolver";

const App = async () => {
  const conn = await createConnection();
  const schema = await buildSchema({
    resolvers: [UserResolver, PostResolver],
  });
  const server = new ApolloServer({
    schema,
    subscriptions: {
      path: "/subscriptions",
    },
  });
  await server.listen(PORT);
  console.log(`Server running on Port: ${PORT}`);
};

App();
