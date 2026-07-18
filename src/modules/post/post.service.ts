import { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

//? get all posts
const getAllPost = async () => {
  const result = await prisma.post.findMany();
  return result;
};

//? create post
const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string,
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
};

export const postService = {
  createPost,
  getAllPost,
};
