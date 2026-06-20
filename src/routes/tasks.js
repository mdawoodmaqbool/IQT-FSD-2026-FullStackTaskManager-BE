import { Router } from "express";
import {
  addTask,
  editTask,
  listTasks,
  removeTaskHandler,
} from "../controllers/taskController.js";

const router = Router();

router.get("/", listTasks);
router.post("/", addTask);
router.patch("/:id", editTask);
router.delete("/:id", removeTaskHandler);

export default router;
