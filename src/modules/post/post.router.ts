import express, { Router } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

//? router gor getting all posts
router.get("/", postController.getAllPost);

//? route for creating post
router.post("/", auth(UserRole.USER), postController.createPost);

//? route for get post by id
router.get("/:postId", postController.getPostById);

export const postRouter: Router = router;
