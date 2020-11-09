import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import * as PostgressConnectionStringParser from "pg-connection-string";

export const PORT = 5000;
export const IS_PROD = process.env.ENV === "production";

const databaseUrl = process.env.DATABASE_URL || "";
const connectionOptions = PostgressConnectionStringParser.parse(databaseUrl);

export const TYPE_ORM_CONFIG: PostgresConnectionOptions = {
  type: "postgres",
  username: "postgres",
  host: IS_PROD ? connectionOptions.host || undefined : "localhost",
  port: IS_PROD ? parseInt(connectionOptions.port || "") : 5000,
  password: IS_PROD ? connectionOptions.password: undefined,
  database: IS_PROD ? connectionOptions.database || undefined : "gql",
  synchronize: true,
  entities: ["src/models/*.ts"],
  extra: {
    ssl: true,
  },
};
