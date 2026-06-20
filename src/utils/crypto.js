import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export async function hashPassword(password) {
  return bcrypt.hash(password, config.bcryptRounds);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export async function hashOtp(code) {
  return bcrypt.hash(code, 10);
}

export async function verifyOtp(code, codeHash) {
  return bcrypt.compare(code, codeHash);
}

export function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
