const VALID_STATUSES = ["pending", "in_progress", "completed"];

export function validateCreateTask(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    return ["Request body is required"];
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    errors.push("Title is required");
  } else if (body.title.trim().length > 120) {
    errors.push("Title must be 120 characters or less");
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== "string") {
      errors.push("Description must be a string");
    } else if (body.description.length > 500) {
      errors.push("Description must be 500 characters or less");
    }
  }

  return errors;
}

export function validateUpdateTask(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    return ["Request body is required"];
  }

  if (Object.keys(body).length === 0) {
    errors.push("At least one field is required");
  }

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      errors.push("Title cannot be empty");
    } else if (body.title.trim().length > 120) {
      errors.push("Title must be 120 characters or less");
    }
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== "string") {
      errors.push("Description must be a string");
    } else if (body.description.length > 500) {
      errors.push("Description must be 500 characters or less");
    }
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push("Status must be pending, in_progress, or completed");
  }

  return errors;
}

export { VALID_STATUSES };
