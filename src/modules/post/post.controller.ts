import { Request, Response } from "express";
import { postService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  try {
    const result = await postService.createPost(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    //  server console terminal for this output!
    console.error("Full Prisma Error:", error.message);

    res
      .status(400)
      .json({ error: "Post creation failed.", details: error.message });
  }
};

export const postController = {
  createPost,
};
