import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { resolvers } from "./graphql/resolvers.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import tasksRouter from "./routes/tasks.js";

export async function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
    }),
  );
  app.use(express.json());

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError(formattedError, error) {
      const status = error.extensions?.status ?? 500;
      return {
        message: formattedError.message,
        extensions: { code: formattedError.extensions?.code, status },
      };
    },
  });

  await apolloServer.start();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(
    "/graphql",
    cors({
      origin: config.corsOrigin,
    }),
    express.json(),
    expressMiddleware(apolloServer),
  );

  app.use("/api/tasks", tasksRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
