import { login, resetPassword, signup } from "../services/authService.js";

function handleAuthError(res, error, next) {
  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }

  return next(error);
}

export async function signupHandler(req, res, next) {
  try {
    const result = await signup(req.body);
    res.status(201).json(result);
  } catch (error) {
    handleAuthError(res, error, next);
  }
}

export async function loginHandler(req, res, next) {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (error) {
    handleAuthError(res, error, next);
  }
}

export async function resetPasswordHandler(req, res, next) {
  try {
    const result = await resetPassword(req.body);
    res.json(result);
  } catch (error) {
    handleAuthError(res, error, next);
  }
}
