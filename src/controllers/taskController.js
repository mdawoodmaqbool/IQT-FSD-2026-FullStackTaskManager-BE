import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask,
} from "../store/taskStore.js";
import {
  validateCreateTask,
  validateUpdateTask,
} from "../utils/validation.js";

function sendValidationError(res, errors) {
  return res.status(400).json({ message: errors.join(". ") });
}

export function listTasks(_req, res) {
  res.json(getAllTasks());
}

export function addTask(req, res) {
  const errors = validateCreateTask(req.body);
  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  const task = createTask({
    title: req.body.title,
    description: req.body.description,
  });

  res.status(201).json(task);
}

export function editTask(req, res) {
  const task = getTaskById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const errors = validateUpdateTask(req.body);
  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  const updated = updateTask(req.params.id, req.body);
  res.json(updated);
}

export function removeTask(req, res) {
  const deleted = deleteTask(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.status(204).send();
}
