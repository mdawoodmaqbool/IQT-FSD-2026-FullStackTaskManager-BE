import {
  forgotPassword,
  login,
  resendOtp,
  resetPassword,
  signup,
  verifySignupOtp,
} from "../services/authService.js";

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

export async function verifyOtpHandler(req, res, next) {
  try {
    const result = await verifySignupOtp(req.body);
    res.json(result);
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

export async function resendOtpHandler(req, res, next) {
  try {
    const result = await resendOtp(req.body);
    res.json(result);
  } catch (error) {
    handleAuthError(res, error, next);
  }
}

export async function forgotPasswordHandler(req, res, next) {
  try {
    const result = await forgotPassword(req.body);
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
