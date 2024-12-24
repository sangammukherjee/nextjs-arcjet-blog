import { blogPostRules } from "@/lib/arcjet";
import { verifyAuth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { request, shield } from "@arcjet/next";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { z } from "zod";

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "category is required"),
  coverImage: z.string().min(1, "Image is required"),
});

export async function createBlogPostAction(data) {
  const token = (await cookies()).get("token")?.value;
  const user = await verifyAuth(token);

  if (!user) {
    return {
      error: "Unauth user",
      status: 401,
    };
  }

  const validateFields = blogPostSchema.safeParse(data);

  if (!validateFields.success) {
    return {
      error: validateFields.error.errors[0].message,
    };
  }

  const { title, coverImage, content, category } = validateFields.data;

  try {
    const req = await request();
    const headersList = await headers();
    const isSuspicious = headersList.get("x-arcjet-suspicious") === "true";

    const decision = await blogPostRules.protect(req, {
      shield: {
        params: {
          title,
          content,
          isSuspicious,
        },
      },
      requested: 10,
    });

    console.log(decision);

    if (decision.isErrored()) {
      return {
        error: "An error occured!",
      };
    }

    if (decision.isDenied()) {
      if (decision.reason.isShield()) {
        return {
          error:
            "Input validation failed! Potentially malicious content detected",
        };
      }

      if (decision.reason.isBot()) {
        return {
          error: "Bot activity detected",
        };
      }

      return {
        error: "Request denied",
        status: 403,
      };
    }

    await connectToDatabase();
    const post = new BlogPost({
      title,
      content,
      author: user.userId,
      coverImage,
      category,
      comments: [],
      upvotes: [],
    });

    await post.save();
    revalidatePath("/");
    return {
      success: true,
      post,
    };
  } catch (e) {
    return {
      error: e,
    };
  }
}

export async function getBlogPostsAction() {
  const token = (await cookies()).get("token")?.value;
  const user = await verifyAuth(token);

  if (!user) {
    return {
      error: "Unauth user",
      status: 401,
    };
  }

  try {
    const req = await request();
    const decision = await blogPostRules.protect(req, { requested: 10 });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          error: "Rate limit excedeed! Please try after some time",
          statu: 429,
        };
      }

      if (decision.reason.isBot()) {
        return {
          error: "Bot activity detected",
        };
      }
      return {
        error: "Request denied",
        status: 403,
      };
    }

    console.log(decision, "decision123");

    await connectToDatabase();

    const posts = await BlogPost.find({})
      .sort({ createdAt: -1 })
      .populate("author", "name");
    const serializedPosts = posts.map((post) => ({
      _id: post._id.toString(),
      title: post.title,
      coverImage: post.coverImage,
      author: {
        _id: post.author._id.toString(),
        name: post.author.name,
      },
      category: post.category,
      createdAt: post.createdAt.toISOString(),
    }));

    return {
      success: true,
      posts: serializedPosts,
    };
  } catch (e) {
    return {
      error: "Failed to fetch the blogs! Please try again",
    };
  }
}

export async function getBlogPostByIdAction(id) {
  const token = (await cookies()).get("token")?.value;
  const user = await verifyAuth(token);

  if (!user) {
    return {
      error: "Unauth user",
      status: 401,
    };
  }

  try {
    const req = await request();
    const decision = await blogPostRules.protect(req, { requested: 5 });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          error: "Rate limit excedeed! Please try after some time",
          statu: 429,
        };
      }

      if (decision.reason.isBot()) {
        return {
          error: "Bot activity detected",
        };
      }
      return {
        error: "Request denied",
        status: 403,
      };
    }

    await connectToDatabase();
    const post = await BlogPost.findOne({ _id: id }).populate("author", "name");
    return {
      success: true,
      post: JSON.stringify(post),
    };
  } catch (e) {
    return {
      error: "Failed to fetch the blog detail! Please try again",
    };
  }
}
