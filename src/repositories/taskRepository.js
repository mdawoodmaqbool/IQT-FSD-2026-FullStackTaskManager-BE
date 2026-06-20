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

function buildWhere(userId, status) {
  return {
    userId,
    ...(status ? { status } : {}),
  };
}

export async function findTasks(userId, { status, limit, offset = 0 } = {}) {
  const tasks = await prisma.task.findMany({
    where: buildWhere(userId, status),
    select: TASK_SELECT,
    orderBy: { createdAt: "desc" },
    take: normalizeLimit(limit),
    skip: Math.max(offset, 0),
  });

  return tasks.map(toTaskResponse);
}

export async function findTaskById(userId, id) {
  const task = await prisma.task.findFirst({
    where: { id, userId },
    select: TASK_SELECT,
  });

  return task ? toTaskResponse(task) : null;
}

export async function countTasks(userId, status) {
  return prisma.task.count({
    where: buildWhere(userId, status),
  });
}

export async function insertTask(userId, { title, description }) {
  const task = await prisma.task.create({
    data: {
      userId,
      title: title.trim(),
      description: description?.trim() ? description.trim() : null,
    },
    select: TASK_SELECT,
  });

  return toTaskResponse(task);
}

export async function patchTask(userId, id, updates) {
  const existing = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

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

  const task = await prisma.task.update({
    where: { id },
    data,
    select: TASK_SELECT,
  });

  return toTaskResponse(task);
}

export async function removeTask(userId, id) {
  const result = await prisma.task.deleteMany({
    where: { id, userId },
  });

  return result.count > 0;
}
