import { Router } from "express";
import {
  forgotPasswordHandler,
  loginHandler,
  resendOtpHandler,
  resetPasswordHandler,
  signupHandler,
  verifyOtpHandler,
} from "../controllers/authController.js";
import { authRateLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.use(authRateLimiter);

router.post("/signup", signupHandler);
router.post("/verify-otp", verifyOtpHandler);
router.post("/login", loginHandler);
router.post("/resend-otp", resendOtpHandler);
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);

export default router;
