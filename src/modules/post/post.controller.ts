import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";

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

    const result = await postService.getAllPost({
      search: searchString,
      tags,
      isFeatured,
      status,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: "Couldn't get posts!", details: error.message });
  }
};

//? create a post
const createPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized!",
      });
    }
    const result = await postService.createPost(req.body, user.id as string);
    res.status(201).json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: "Post creation failed.", details: error.message });
  }
};

export const postController = {
  createPost,
  getAllPost,
};
