import {
  CommentStatus,
  Post,
  PostStatus,
} from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

//? get all posts
const getAllPost = async ({
  search,
  tags,
  isFeatured,
  status,
  authorId,
  limit,
  skip,
  sortBy,
  sortOrder,
  page,
}: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  status: PostStatus | undefined;
  authorId: string | undefined;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
  page: number;
}) => {
  const andConditions: PostWhereInput[] = [];
  if (search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search,
          },
        },
      ],
    });
  }

  if (tags && tags.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: tags,
      },
    });
  }

  if (typeof isFeatured === "boolean") {
    andConditions.push({ isFeatured });
  }

  if (status) {
    andConditions.push({ status });
  }

  if (authorId) {
    andConditions.push({ authorId });
  }
  const whereCondition: PostWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.post.findMany({
      take: limit,
      skip,
      where: whereCondition,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        _count: {
          select: { comments: true },
        },
      },
    }),
    prisma.post.count({
      where: whereCondition,
    }),
  ]);

  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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

//? get post by id
const getPostById = async (postId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Verify post existence first to prevent runtime P2025 crash
    const postExists = await tx.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!postExists) {
      return null;
    }

    // 2. Increment view count and return full post with comments
    return await tx.post.update({
      where: { id: postId },
      data: {
        views: { increment: 1 },
      },
      include: {
        comments: {
          where: {
            parentId: null,
            status: CommentStatus.APPROVED,
          },
          orderBy: { createdAt: "desc" },
          include: {
            replies: {
              where: { status: CommentStatus.APPROVED },
              orderBy: { createdAt: "asc" },
              include: {
                replies: {
                  where: { status: CommentStatus.APPROVED },
                  orderBy: { createdAt: "asc" },
                },
              },
            },
          },
        },
        _count: { select: { comments: true } },
      },
    });
  });
};

//? get all post for author
const getMyPosts = async (authorId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: authorId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
  return result;
};

export const postService = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
};
