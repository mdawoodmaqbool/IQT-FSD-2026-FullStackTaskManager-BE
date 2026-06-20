import { randomUUID } from "node:crypto";

const tasks = new Map();

export function getAllTasks() {
  return Array.from(tasks.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export function getTaskById(id) {
  return tasks.get(id) ?? null;
}

export function createTask({ title, description }) {
  const now = new Date().toISOString();
  const task = {
    id: randomUUID(),
    title: title.trim(),
    description: description?.trim() ? description.trim() : null,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  tasks.set(task.id, task);
  return task;
}

export function updateTask(id, updates) {
  const task = tasks.get(id);
  if (!task) {
    return null;
  }

  if (updates.title !== undefined) {
    task.title = updates.title.trim();
  }

  if (updates.description !== undefined) {
    task.description = updates.description?.trim()
      ? updates.description.trim()
      : null;
  }

  if (updates.status !== undefined) {
    task.status = updates.status;
  }

  task.updatedAt = new Date().toISOString();
  tasks.set(id, task);
  return task;
}

export function deleteTask(id) {
  return tasks.delete(id);
}
