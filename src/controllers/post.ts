import { Request, Response, NextFunction } from "express";
import Post from "../models/Post";
import { IUserDocument } from "../models/User";
import {
  throwPostNotFoundError,
  throwActionNotAllowedError
} from "../utils/throwError";
import { checkBody } from "../utils/validator";

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page } = req.query;
    const myCustomLabels = {
      totalDocs: "total_count",
      docs: "posts",
      limit: "limit_value",
      page: "current_page",
      nextPage: "next",
      prevPage: "prev",
      totalPages: "num_pages",
      pagingCounter: "slNo",
      meta: "page"
    };

    const options = {
      page: page,
      limit: 2,
      customLabels: myCustomLabels
    };

    const posts = await Post.paginate({}, options);

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate("user", "-password");

    if (post) {
      res.json({
        success: true,
        data: { post }
      });
    } else {
      throwPostNotFoundError();
    }
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    const { body } = req.body;

    checkBody(body);

    const user = req.currentUser as IUserDocument;

    if (post) {
      if (post.username === user.username) {
        // const resPost = await post.update({ body });

        const resPost = await Post.findByIdAndUpdate(
          id,
          { body },
          { new: true }
        );

        res.json({
          success: true,
          data: { message: "updated successfully", post: resPost }
        });
      } else {
        throwActionNotAllowedError();
      }
    } else {
      throwPostNotFoundError();
    }
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    const user = req.currentUser as IUserDocument;

    if (post) {
      if (post.username === user.username) {
        await Post.findByIdAndDelete(id);

        res.json({
          success: true,
          data: { message: "deleted successfully" }
        });
      } else {
        throwActionNotAllowedError();
      }
    } else {
      throwPostNotFoundError();
    }
  } catch (error) {
    next(error);
  }
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.currentUser as IUserDocument;

    const { body } = req.body;

    checkBody(body);

    const newPost = new Post({
      body,
      createdAt: new Date().toISOString(),
      username: user.username,
      user: user.id
    });

    const post = await newPost.save();

    res.json({
      success: true,
      data: { message: "created successfully", post }
    });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    const user = req.currentUser as IUserDocument;

    if (post) {
      if (post.likes.find(like => like.username === user.username)) {
        post.likes = post.likes.filter(like => like.username !== user.username);

        // user.like_posts = user.like_posts.filter(
        //   post => post.username !== user.username
        // );

        user.like_posts = user.like_posts.filter(
          id => !user.like_posts.includes(id)
        );
      } else {
        post.likes.push({
          username: user.username,
          createdAt: new Date().toISOString()
        });

        // user.like_posts.push(post);
        user.like_posts.push(post.id);
      }

      await post.save();

      await user.save();

      res.json({
        success: true,
        data: { post }
      });
    } else {
      throwPostNotFoundError();
    }
  } catch (error) {
    next(error);
  }
};
