const { Router } = require("express");
const mainRouter = Router();
const mainController = require("../controllers/mainController");
const db = require("../db/queries");

// Get all users
mainRouter.get("/api/v1/users", async (req, res) => {
  const getUsers = await db.getAllUsers();
  res.json({ message: "List of all users: ", getUsers });
});

// Get user by ID
mainRouter.get("/api/v1/users/:id", async (req, res) => {
  const user = await db.readUser(req.params.id);
  res.json({ message: "User details: ", user });
});

// Create new user
mainRouter.post(
  "/api/v1/users",
  async (req, res, next) => {
    const newUser = await db.insertNewUser(
      // replace headers with body once form is created
      req.headers.firstname,
      req.headers.lastname,
      req.headers.email,
      req.headers.password
    );
    req.user = newUser;
    next();
  },
  mainController.signToken,
  (req, res) => {
    res.json({
      message: "New user created!: ",
      user: req.user,
      token: req.token,
    });
  }
);

// Update a user
mainRouter.put(
  "/api/v1/users/:id",
  mainController.verifyToken,
  async (req, res) => {
    const editUser = await db.updateUser(
      req.params.id,
      req.headers.firstname,
      req.headers.lastname,
      req.headers.email
    );
    res.json({ message: "User updated successfully!", editUser });
  }
);

// Delete a user
mainRouter.delete(
  "/api/v1/users/:id",
  mainController.verifyToken,
  async (req, res) => {
    const deleteUser = await db.deleteUser(req.params.id);
    res.json({ message: "User deleted successfully", deleteUser });
  }
);

// Posts Routes

// Get all posts
mainRouter.get("/api/v1/posts", async (req, res) => {
  const getPosts = await db.getAllPosts();
  res.json({ message: "List of all posts: ", getPosts });
});

// Get all posts by ID
mainRouter.get("/api/v1/posts/:id", async (req, res) => {
  const post = await db.readPost(req.params.id);
  res.json({ message: "Post details: ", post });
});

// Create new post
mainRouter.post(
  "/api/v1/posts",
  mainController.verifyToken,
  async (req, res) => {
    const newPost = await db.createPost(
      req.headers.user,
      "My fifth title",
      "something bleh...",
      true
    );
    res.json({ message: "Blog posting successful", newPost });
  }
);

// Update post
mainRouter.put(
  "/api/v1/posts/:id",
  mainController.verifyToken,
  async (req, res) => {
    const update = await db.editPost(
      req.params.id,
      "Just 3rd Title",
      "Something a tiny bit more interesting",
      false
    );
    res.json({
      message: "Post edited successufly",
      update,
    });
  }
);

// Delete post
mainRouter.delete(
  "/api/v1/posts/:id",
  mainController.verifyToken,
  async (req, res) => {
    const deletePost = await db.deletePost(req.params.id);
    res.json({ message: "Post deleted successfuly", deletePost });
  }
);

// Comments route

// Get comments for a post
mainRouter.get("/api/v1/posts/:postId/comments", async (req, res) => {
  const showPostComments = await db.showPostComments(req.params.postId);
  res.json({ message: "Showing all comments for post", showPostComments });
});

// Get a specific comment
mainRouter.get("/api/v1/comments/:id", async (req, res) => {
  const showSpecificComment = await db.showSpecificComment(req.params.id);
  res.json({ message: "Showing specific comment: ", showSpecificComment });
});

// Add a comment to a post
mainRouter.post(
  "/api/v1/posts/:postId/comments",
  mainController.verifyToken,
  async (req, res) => {
    const createComment = await db.createComment(
      req.headers.user,
      "Boo-urns!",
      req.params.postId
    );
    res.json({ message: "comment added successfully!", createComment });
  }
);

// Update a comment
mainRouter.put(
  "/api/v1/comments/:id",
  mainController.verifyToken,
  async (req, res) => {
    const updateComment = await db.updateComment(
      req.params.id,
      "Are you saying Boo or Boo-urns?"
    );
    res.json({ message: "Comment updated", updateComment });
  }
);

// Delete a comment
mainRouter.delete(
  "/api/v1/comments/:id",
  mainController.verifyToken,
  async (req, res) => {
    const deleteComment = await db.deleteComment(req.params.id);
    res.json({ message: "Comment deleted successfully: ", deleteComment });
  }
);

// Always export back to app.js at the end

module.exports = mainRouter;
