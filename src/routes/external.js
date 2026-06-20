import { Router } from "express";
import {
  getWeather,
  listCountries,
} from "../controllers/externalController.js";
import { authenticate } from "../middleware/auth.js";
import { externalRateLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.use(externalRateLimiter);

router.get("/countries", listCountries);
router.get("/weather", authenticate, getWeather);

export default router;
