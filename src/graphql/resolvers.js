import {
  forgotPassword,
  getUserById,
  login,
  resendOtp,
  resetPassword,
  signup,
  verifySignupOtp,
} from "../services/authService.js";
import {
  countTasks,
  findTaskById,
  findTasks,
  insertTask,
  patchTask,
  removeTask,
} from "../repositories/taskRepository.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validateCreateTask,
  validateUpdateTask,
} from "../utils/validation.js";

function validationError(errors) {
  const error = new Error(errors.join(". "));
  error.extensions = { code: "BAD_USER_INPUT", status: 400 };
  return error;
}

function notFoundError(message = "Task not found") {
  const error = new Error(message);
  error.extensions = { code: "NOT_FOUND", status: 404 };
  return error;
}

function authServiceError(error) {
  const wrapped = new Error(error.message);
  wrapped.extensions = {
    code: error.status === 401 ? "UNAUTHENTICATED" : "BAD_USER_INPUT",
    status: error.status || 400,
  };
  return wrapped;
}

export const resolvers = {
  Query: {
    me: (_parent, _args, context) => {
      requireAuth(context.user);
      return context.user;
    },
    tasks: (_parent, args, context) => {
      requireAuth(context.user);
      return findTasks(context.user.id, args);
    },
    task: async (_parent, { id }, context) => {
      requireAuth(context.user);
      const task = await findTaskById(context.user.id, id);
      return task ?? null;
    },
    taskCounts: async (_parent, _args, context) => {
      requireAuth(context.user);
      const userId = context.user.id;
      const [all, pending, in_progress, completed] = await Promise.all([
        countTasks(userId),
        countTasks(userId, "pending"),
        countTasks(userId, "in_progress"),
        countTasks(userId, "completed"),
      ]);

      return { all, pending, in_progress, completed };
    },
  },

  Mutation: {
    signup: async (_parent, { email, password }) => {
      try {
        return await signup({ email, password });
      } catch (error) {
        throw authServiceError(error);
      }
    },
    verifyOtp: async (_parent, { email, code }) => {
      try {
        return await verifySignupOtp({ email, code });
      } catch (error) {
        throw authServiceError(error);
      }
    },
    login: async (_parent, { email, password }) => {
      try {
        return await login({ email, password });
      } catch (error) {
        throw authServiceError(error);
      }
    },
    resendOtp: async (_parent, { email, type }) => {
      try {
        return await resendOtp({ email, type });
      } catch (error) {
        throw authServiceError(error);
      }
    },
    forgotPassword: async (_parent, { email }) => {
      try {
        return await forgotPassword({ email });
      } catch (error) {
        throw authServiceError(error);
      }
    },
    resetPassword: async (_parent, { email, code, password }) => {
      try {
        return await resetPassword({ email, code, password });
      } catch (error) {
        throw authServiceError(error);
      }
    },
    createTask: (_parent, { title, description }, context) => {
      requireAuth(context.user);
      const errors = validateCreateTask({ title, description });
      if (errors.length > 0) {
        throw validationError(errors);
      }

      return insertTask(context.user.id, { title, description });
    },
    updateTask: async (_parent, { id, ...input }, context) => {
      requireAuth(context.user);
      const errors = validateUpdateTask(input);
      if (errors.length > 0) {
        throw validationError(errors);
      }

      const updated = await patchTask(context.user.id, id, input);
      if (!updated) {
        throw notFoundError();
      }

      return updated;
    },
    deleteTask: async (_parent, { id }, context) => {
      requireAuth(context.user);
      const deleted = await removeTask(context.user.id, id);
      if (!deleted) {
        throw notFoundError();
      }

      return true;
    },
  },
};
