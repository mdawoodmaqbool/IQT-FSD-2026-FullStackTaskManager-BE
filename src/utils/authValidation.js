const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function validateEmail(email) {
  if (typeof email !== "string" || !EMAIL_REGEX.test(normalizeEmail(email))) {
    return "A valid email address is required";
  }
  return null;
}

export function validatePassword(password) {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include at least one letter and one number";
  }

  return null;
}

export function validateOtp(code) {
  if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
    return "OTP must be a 6-digit code";
  }
  return null;
}
