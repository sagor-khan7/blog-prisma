import express, { Router } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

//? route for getting all posts
router.get("/", postController.getAllPost);

//? route for creating post
router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.createPost,
);

//? route for getting all of author's posts (MUST BE BEFORE /:postId)
router.get(
  "/my-posts",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.getMyPosts,
);

//? route for getting post by id
router.get("/:postId", postController.getPostById);

//? update post
router.patch(
  "/:postId",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.updatePost,
);

router.delete(
  "/:postId",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.deletePost,
);
export const postRouter: Router = router;
