import {
  countTasks,
  findTaskById,
  findTasks,
  insertTask,
  patchTask,
  removeTask,
} from "../repositories/taskRepository.js";
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

export const resolvers = {
  Query: {
    tasks: (_parent, args) => findTasks(args),
    task: async (_parent, { id }) => {
      const task = await findTaskById(id);
      return task ?? null;
    },
    taskCounts: async () => {
      const [all, pending, in_progress, completed] = await Promise.all([
        countTasks(),
        countTasks("pending"),
        countTasks("in_progress"),
        countTasks("completed"),
      ]);

      return { all, pending, in_progress, completed };
    },
  },

  Mutation: {
    createTask: (_parent, { title, description }) => {
      const errors = validateCreateTask({ title, description });
      if (errors.length > 0) {
        throw validationError(errors);
      }

      return insertTask({ title, description });
    },

    updateTask: async (_parent, { id, ...input }) => {
      const errors = validateUpdateTask(input);
      if (errors.length > 0) {
        throw validationError(errors);
      }

      const updated = await patchTask(id, input);
      if (!updated) {
        throw notFoundError();
      }

      return updated;
    },

    deleteTask: async (_parent, { id }) => {
      const deleted = await removeTask(id);
      if (!deleted) {
        throw notFoundError();
      }

      return true;
    },
  },
};
