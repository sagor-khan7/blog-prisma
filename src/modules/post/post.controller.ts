import { Request, Response } from "express";
import { postService } from "./post.service";

//? get all posts
const getAllPost = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const searchString = typeof search === "string" ? search : undefined;

    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

    const result = await postService.getAllPost({ search: searchString, tags });

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
