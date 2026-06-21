import { Router } from "express";
import {
  loginHandler,
  resetPasswordHandler,
  signupHandler,
} from "../controllers/authController.js";
import { authRateLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.use(authRateLimiter);

router.post("/signup", signupHandler);
router.post("/login", loginHandler);
router.post("/reset-password", resetPasswordHandler);

export default router;
