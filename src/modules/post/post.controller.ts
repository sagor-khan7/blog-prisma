import { NextFunction, Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middlewares/auth";

//? get all posts
const getAllPost = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const searchString = typeof search === "string" ? search : undefined;

    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

    const isFeatured =
      req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
          ? false
          : undefined;

    const status = req.query.status as PostStatus | undefined;
    const ALLOWED_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

    if (status && !ALLOWED_STATUSES.includes(status as string)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status parameter. Allowed values are ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const authorId =
      typeof req.query.authorId === "string" && req.query.authorId.trim() !== ""
        ? req.query.authorId
        : undefined;

    const options = paginationSortingHelper(req.query);
    const { page, limit, skip, sortBy, sortOrder } = options;

    const result = await postService.getAllPost({
      search: searchString,
      tags,
      isFeatured,
      status,
      authorId,
      limit,
      skip,
      sortBy,
      page,
      sortOrder,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: "Couldn't get posts!", details: error.message });
  }
};

//? create a post
const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized!",
      });
    }
    const result = await postService.createPost(req.body, user.id as string);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

//? get post by id
const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      throw new Error("Post Id is required!");
    }

    const result = await postService.getPostById(postId as string);
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: "Couldn't get post!", details: error.message });
  }
};

//? get all post for author
const getMyPosts = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("You are unauthorized!");
    }
    console.log("User data: ", user);
    const result = await postService.getMyPosts(user.id);
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: "Couldn't get post!", details: error.message });
  }
};

//? update post
const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("You are unauthorized!");
    }
    const { postId } = req.params;

    const isAdmin = user.role === UserRole.ADMIN;

    const result = await postService.updatePost(
      postId as string,
      req.body,
      user.id,
      isAdmin,
    );
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

//? delete post
const deletePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("You are unauthorized!");
    }

    const { postId } = req.params;
    const isAdmin = user.role === UserRole.ADMIN;
    const result = await postService.deletePost(
      postId as string,
      user.id,
      isAdmin,
    );
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: "Post update failed!", details: error.message });
  }
};

//? get stats
const getStats = async (req: Request, res: Response) => {
  try {
    const result = await postService.getStats();
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: "Couldn't get stats!", details: error.message });
  }
};
export const postController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getStats,
};
