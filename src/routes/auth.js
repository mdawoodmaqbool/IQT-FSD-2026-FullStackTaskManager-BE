import { Router } from "express";
import { loginHandler, signupHandler } from "../controllers/authController.js";
import { authRateLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.use(authRateLimiter);

router.post("/signup", signupHandler);
router.post("/login", loginHandler);

export default router;
