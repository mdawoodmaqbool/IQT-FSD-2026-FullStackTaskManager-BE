import {
  notFoundError,
  toGraphQLError,
  validationError,
} from "../utils/graphqlErrors.js";
import {
  getUserById,
  login,
  signup,
} from "../services/authService.js";
import {
  countTasks,
  findTaskById,
  findTasks,
  insertTask,
  patchTask,
  removeTask,
} from "../repositories/taskRepository.js";
import {
  getCountries,
  getWeatherByCountryCode,
} from "../services/externalApiService.js";
import {
  validateCreateTask,
  validateUpdateTask,
} from "../utils/validation.js";
import { requireAuth } from "../middleware/auth.js";

export const resolvers = {
  Query: {
    me: (_parent, _args, context) => {
      requireAuth(context.user);
      return context.user;
    },
    tasks: async (_parent, args, context) => {
      try {
        requireAuth(context.user);
        return await findTasks(context.user.id, args);
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
    task: async (_parent, { id }, context) => {
      try {
        requireAuth(context.user);
        const task = await findTaskById(context.user.id, id);
        return task ?? null;
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
    taskCounts: async (_parent, _args, context) => {
      try {
        requireAuth(context.user);
        const userId = context.user.id;
        const [all, pending, in_progress, completed] = await Promise.all([
          countTasks(userId),
          countTasks(userId, "pending"),
          countTasks(userId, "in_progress"),
          countTasks(userId, "completed"),
        ]);

        return { all, pending, in_progress, completed };
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
    countries: async () => {
      try {
        return await getCountries();
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
    weather: async (_parent, _args, context) => {
      try {
        requireAuth(context.user);

        if (!context.user.countryCode) {
          throw toGraphQLError({
            message: "No country is set on your profile.",
            status: 400,
          });
        }

        return await getWeatherByCountryCode(context.user.countryCode);
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
  },

  Mutation: {
    signup: async (_parent, { email, password, countryCode }) => {
      try {
        return await signup({ email, password, countryCode });
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
    login: async (_parent, { email, password }) => {
      try {
        return await login({ email, password });
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
    createTask: async (_parent, { title, description }, context) => {
      try {
        requireAuth(context.user);
        const errors = validateCreateTask({ title, description });
        if (errors.length > 0) {
          throw validationError(errors);
        }

        return await insertTask(context.user.id, { title, description });
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
    updateTask: async (_parent, { id, ...input }, context) => {
      try {
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
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
    deleteTask: async (_parent, { id }, context) => {
      try {
        requireAuth(context.user);
        const deleted = await removeTask(context.user.id, id);
        if (!deleted) {
          throw notFoundError();
        }

        return true;
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
  },
};
