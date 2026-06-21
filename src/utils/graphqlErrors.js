const PRISMA_ERROR_MESSAGES = {
  P1001: "Unable to connect to the database. Please try again later.",
  P1003: "Database not found. Contact support if this continues.",
  P2002: "This record already exists.",
  P2025: "The requested record was not found.",
};

export function toGraphQLError(error) {
  if (error?.extensions?.code) {
    return error;
  }

  if (typeof error?.status === "number") {
    const wrapped = new Error(error.message);
    wrapped.extensions = {
      code: error.status === 401 ? "UNAUTHENTICATED" : "BAD_USER_INPUT",
      status: error.status,
    };
    return wrapped;
  }

  if (error?.code && PRISMA_ERROR_MESSAGES[error.code]) {
    const wrapped = new Error(PRISMA_ERROR_MESSAGES[error.code]);
    wrapped.extensions = {
      code: error.code === "P1001" ? "SERVICE_UNAVAILABLE" : "BAD_USER_INPUT",
      status: error.code === "P1001" ? 503 : 400,
    };
    return wrapped;
  }

  if (
    error instanceof TypeError ||
    (typeof error?.message === "string" &&
      (error.message.includes("findUnique") ||
        error.message.includes("findFirst") ||
        error.message.includes("create(")))
  ) {
    console.error("Database client misconfiguration:", error);
    const wrapped = new Error(
      "Authentication service is unavailable. Restart the API using the local dev database script.",
    );
    wrapped.extensions = { code: "SERVICE_UNAVAILABLE", status: 503 };
    return wrapped;
  }

  console.error(error);

  const wrapped = new Error(
    error?.message && !error.message.includes("Cannot read properties")
      ? error.message
      : "Something went wrong. Please try again.",
  );
  wrapped.extensions = { code: "INTERNAL_SERVER_ERROR", status: 500 };
  return wrapped;
}

export function validationError(errors) {
  const error = new Error(errors.join(". "));
  error.extensions = { code: "BAD_USER_INPUT", status: 400 };
  return error;
}

export function notFoundError(message = "Task not found") {
  const error = new Error(message);
  error.extensions = { code: "NOT_FOUND", status: 404 };
  return error;
}

export function authRequiredError() {
  const error = new Error("Please sign in to continue.");
  error.extensions = { code: "UNAUTHENTICATED", status: 401 };
  return error;
}
