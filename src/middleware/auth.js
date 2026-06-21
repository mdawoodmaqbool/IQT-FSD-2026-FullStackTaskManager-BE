import { verifyToken } from "../utils/crypto.js";
import { getUserById } from "../services/authService.js";

function readBearerToken(header) {
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice(7).trim();
  return token || null;
}

export async function authenticate(req, res, next) {
  const token = readBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  try {
    const payload = verifyToken(token);
    const user = await getUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Your session has expired. Please sign in again." });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Your session is invalid. Please sign in again." });
  }
}

export async function buildAuthContext(req) {
  const token = readBearerToken(req.headers.authorization);

  if (!token) {
    return { user: null };
  }

  try {
    const payload = verifyToken(token);
    const user = await getUserById(payload.sub);

    if (!user) {
      return { user: null, authError: "SESSION_EXPIRED" };
    }

    return { user };
  } catch {
    return { user: null, authError: "INVALID_TOKEN" };
  }
}

export function requireAuth(user) {
  if (!user) {
    const error = new Error("Please sign in to continue.");
    error.extensions = { code: "UNAUTHENTICATED", status: 401 };
    throw error;
  }
}
