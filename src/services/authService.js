import { prisma } from "../db/prisma.js";
import { config } from "../config.js";
import { sendOtpEmail } from "./mailService.js";
import {
  generateOtpCode,
  hashOtp,
  hashPassword,
  signToken,
  verifyOtp,
  verifyPassword,
} from "../utils/crypto.js";
import {
  normalizeEmail,
  validateEmail,
  validateOtp,
  validatePassword,
} from "../utils/authValidation.js";
import {
  getCountries,
  validateCountryCode,
} from "./externalApiService.js";

function authError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getOtpExpiryDate() {
  return new Date(Date.now() + config.otpExpiresMinutes * 60 * 1000);
}

async function createOtpForUser(userId, type) {
  await prisma.otpToken.updateMany({
    where: { userId, type, usedAt: null },
    data: { usedAt: new Date() },
  });

  const code = generateOtpCode();
  const codeHash = await hashOtp(code);

  await prisma.otpToken.create({
    data: {
      userId,
      codeHash,
      type,
      expiresAt: getOtpExpiryDate(),
    },
  });

  return code;
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    countryCode: user.countryCode,
    countryName: user.countryName,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function signup({ email, password, countryCode }) {
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const countryError = await validateCountryCode(countryCode);

  if (emailError || passwordError || countryError) {
    throw authError(
      [emailError, passwordError, countryError].filter(Boolean).join(". "),
    );
  }

  const normalizedEmail = normalizeEmail(email);
  const countries = await getCountries();
  const selectedCountry = countries.find((country) => country.code === countryCode);
  const countryName = selectedCountry?.name ?? countryCode;
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing?.isVerified) {
    throw authError("An account with this email already exists", 409);
  }

  const passwordHash = await hashPassword(password);

  const user =
    existing ??
    (await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        countryCode,
        countryName,
        isVerified: false,
      },
    }));

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, countryCode, countryName },
    });
  }

  const code = await createOtpForUser(user.id, "signup");
  await sendOtpEmail({ to: normalizedEmail, code, purpose: "signup" });

  return {
    message: "Verification code sent to your email",
    email: normalizedEmail,
  };
}

export async function verifySignupOtp({ email, code }) {
  const emailError = validateEmail(email);
  const otpError = validateOtp(code);

  if (emailError || otpError) {
    throw authError([emailError, otpError].filter(Boolean).join(". "));
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw authError("Invalid verification request", 400);
  }

  const otpRecord = await prisma.otpToken.findFirst({
    where: {
      userId: user.id,
      type: "signup",
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord || !(await verifyOtp(code.trim(), otpRecord.codeHash))) {
    throw authError("Invalid or expired verification code", 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    }),
    prisma.otpToken.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);

  const token = signToken({ sub: user.id, email: user.email });
  const updatedUser = { ...user, isVerified: true };

  return {
    token,
    user: toPublicUser(updatedUser),
  };
}

export async function login({ email, password }) {
  const emailError = validateEmail(email);

  if (emailError) {
    throw authError("Invalid email or password", 401);
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw authError("Invalid email or password", 401);
  }

  if (!user.isVerified) {
    throw authError("Please verify your email before logging in", 403);
  }

  const token = signToken({ sub: user.id, email: user.email });

  return {
    token,
    user: toPublicUser(user),
  };
}

export async function resendOtp({ email, type = "signup" }) {
  const emailError = validateEmail(email);

  if (emailError) {
    throw authError(emailError);
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return { message: "If the account exists, a new code has been sent" };
  }

  if (type === "signup" && user.isVerified) {
    throw authError("Account is already verified", 400);
  }

  const code = await createOtpForUser(user.id, type);
  await sendOtpEmail({ to: normalizedEmail, code, purpose: type });

  return { message: "If the account exists, a new code has been sent" };
}

export async function forgotPassword({ email }) {
  const emailError = validateEmail(email);

  if (emailError) {
    throw authError(emailError);
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user?.isVerified) {
    const code = await createOtpForUser(user.id, "reset_password");
    await sendOtpEmail({
      to: normalizedEmail,
      code,
      purpose: "reset_password",
    });
  }

  return {
    message: "If the account exists, a reset code has been sent to your email",
    email: normalizedEmail,
  };
}

export async function resetPassword({ email, code, password }) {
  const emailError = validateEmail(email);
  const otpError = validateOtp(code);
  const passwordError = validatePassword(password);

  if (emailError || otpError || passwordError) {
    throw authError(
      [emailError, otpError, passwordError].filter(Boolean).join(". "),
    );
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw authError("Invalid reset request", 400);
  }

  const otpRecord = await prisma.otpToken.findFirst({
    where: {
      userId: user.id,
      type: "reset_password",
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord || !(await verifyOtp(code.trim(), otpRecord.codeHash))) {
    throw authError("Invalid or expired reset code", 400);
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.otpToken.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { message: "Password updated successfully" };
}

export async function getUserById(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? toPublicUser(user) : null;
}
