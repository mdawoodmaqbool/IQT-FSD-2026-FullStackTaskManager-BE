import { verifyToken } from "../utils/crypto.js";
import { getUserById } from "../services/authService.js";

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const token = header.slice(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.sub);

    if (!user?.isVerified) {
      return res.status(401).json({ message: "Authentication required" });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export async function buildAuthContext(req) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return { user: null };
  }

  try {
    const token = header.slice(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.sub);

    if (!user?.isVerified) {
      return { user: null };
    }

    return { user };
  } catch {
    return { user: null };
  }
}

export function requireAuth(user) {
  if (!user) {
    const error = new Error("Authentication required");
    error.extensions = { code: "UNAUTHENTICATED", status: 401 };
    throw error;
  }
}
