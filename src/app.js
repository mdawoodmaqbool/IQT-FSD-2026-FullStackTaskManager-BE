import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { resolvers } from "./graphql/resolvers.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { buildAuthContext } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.js";
import externalRouter from "./routes/external.js";
import tasksRouter from "./routes/tasks.js";
import { authenticate } from "./middleware/auth.js";

export async function createApp() {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(
    cors({
      origin: config.corsOrigin,
    }),
  );
  app.use(express.json({ limit: "10kb" }));

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

  app.use("/api/auth", authRouter);
  app.use("/api/external", externalRouter);

  app.use(
    "/graphql",
    cors({
      origin: config.corsOrigin,
    }),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => buildAuthContext(req),
    }),
  );

  app.use("/api/tasks", authenticate, tasksRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
