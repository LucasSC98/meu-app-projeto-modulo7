import { Router } from "express";
import { login } from "../controllers/AuthController";

const router = Router();

router.post("/auth/login", login);

export default router;
