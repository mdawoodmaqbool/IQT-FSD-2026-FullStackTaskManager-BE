import { prisma } from "../db/prisma.js";
import { toTaskResponse } from "../utils/taskMapper.js";

const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;

function normalizeLimit(limit) {
  if (!limit || Number.isNaN(limit)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.max(limit, 1), MAX_LIMIT);
}

function buildWhere(status) {
  return status ? { status } : {};
}

export async function findTasks({ status, limit, offset = 0 } = {}) {
  const tasks = await prisma.task.findMany({
    where: buildWhere(status),
    select: TASK_SELECT,
    orderBy: { createdAt: "desc" },
    take: normalizeLimit(limit),
    skip: Math.max(offset, 0),
  });

  return tasks.map(toTaskResponse);
}

export async function findTaskById(id) {
  const task = await prisma.task.findUnique({
    where: { id },
    select: TASK_SELECT,
  });

  return task ? toTaskResponse(task) : null;
}

export async function countTasks(status) {
  return prisma.task.count({
    where: buildWhere(status),
  });
}

export async function insertTask({ title, description }) {
  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() ? description.trim() : null,
    },
    select: TASK_SELECT,
  });

  return toTaskResponse(task);
}

export async function patchTask(id, updates) {
  const data = {};

  if (updates.title !== undefined) {
    data.title = updates.title.trim();
  }

  if (updates.description !== undefined) {
    data.description = updates.description?.trim()
      ? updates.description.trim()
      : null;
  }

  if (updates.status !== undefined) {
    data.status = updates.status;
  }

  try {
    const task = await prisma.task.update({
      where: { id },
      data,
      select: TASK_SELECT,
    });

    return toTaskResponse(task);
  } catch (error) {
    if (error.code === "P2025") {
      return null;
    }

    throw error;
  }
}

export async function removeTask(id) {
  try {
    await prisma.task.delete({ where: { id } });
    return true;
  } catch (error) {
    if (error.code === "P2025") {
      return false;
    }

    throw error;
  }
}
