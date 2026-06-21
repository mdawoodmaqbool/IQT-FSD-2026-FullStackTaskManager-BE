import { prisma } from "../db/prisma.js";
import {
  hashPassword,
  signToken,
  verifyPassword,
} from "../utils/crypto.js";
import {
  normalizeEmail,
  validateEmail,
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

  if (existing) {
    throw authError("An account with this email already exists", 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      countryCode,
      countryName,
      isVerified: true,
    },
  });

  const token = signToken({ sub: user.id, email: user.email });

  return {
    token,
    user: toPublicUser(user),
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

  const token = signToken({ sub: user.id, email: user.email });

  return {
    token,
    user: toPublicUser(user),
  };
}

export async function getUserById(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? toPublicUser(user) : null;
}
