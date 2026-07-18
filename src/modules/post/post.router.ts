import express, { Router } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

//? route for creating post
router.post("/", auth(UserRole.USER), postController.createPost);

export const postRouter: Router = router;
