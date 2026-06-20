import {
  findTasks,
  insertTask,
  patchTask,
  removeTask,
} from "../repositories/taskRepository.js";
import {
  validateCreateTask,
  validateUpdateTask,
} from "../utils/validation.js";

function sendValidationError(res, errors) {
  return res.status(400).json({ message: errors.join(". ") });
}

export async function listTasks(req, res, next) {
  try {
    const status = req.query.status;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;

    const tasks = await findTasks({ status, limit, offset });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function addTask(req, res, next) {
  try {
    const errors = validateCreateTask(req.body);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const task = await insertTask({
      title: req.body.title,
      description: req.body.description,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function editTask(req, res, next) {
  try {
    const errors = validateUpdateTask(req.body);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const updated = await patchTask(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function removeTaskHandler(req, res, next) {
  try {
    const deleted = await removeTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
