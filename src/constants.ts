import { ConnectionOptions, getConnectionOptions } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const IS_PROD = process.env.ENV === "production";

const getOptions = async () => {
  let connectionOptions: ConnectionOptions;
  connectionOptions = {
    type: "postgres",
    synchronize: true,
    logging: false,
    extra: {
      ssl: true,
    },
    entities: ["src/models/*.ts"],
  };
  if (process.env.DATABASE_URL) {
    Object.assign(connectionOptions, { url: process.env.DATABASE_URL });
  } else {
    connectionOptions = await getConnectionOptions();
  }

  return connectionOptions;
};

export const TYPE_ORM_CONFIG = getOptions();
