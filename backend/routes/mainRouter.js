const { Router } = require("express");
const mainRouter = Router();
const mainController = require("../controllers/mainController");
const db = require("../db/queries");
const { validateUser } = require("../controllers/formValidation");
const { validateEmail } = require("../controllers/emailDuplicateValidation");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

// Get all users
mainRouter.get("/api/v1/users", async (req, res) => {
  const getUsers = await db.getAllUsers();
  res.json({ message: "List of all users: ", getUsers });
});

// Get user by ID - unverified
mainRouter.get("/api/v1/users/:id", async (req, res) => {
  const user = await db.readUser(req.params.id);
  res.json({ message: "User details: ", user });
});

// Verified route
mainRouter.get(
  "/api/v1/users/verified/:id",
  mainController.verifyToken,
  async (req, res) => {
    const user = await db.readUser(req.user.user_id);
    res.json({ message: "User details: ", user });
  }
);

// Create new user
mainRouter.post(
  "/api/v1/users",
  [...validateUser, ...validateEmail],

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const uniqueErrors = {};
      errors.array().forEach((error) => {
        if (!uniqueErrors[error.path]) {
          uniqueErrors[error.path] = error;
        }
        // Return to the sign-up page with error messages
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = await db.insertNewUser(
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      hashedPassword
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

// Login user

mainRouter.post(
  "/api/v1/users/login",
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Email and password are required" }] });
      }

      // Find the user in the database
      const user = await db.getUserByEmail(email);
      if (!user) {
        return res
          .status(401)
          .json({ errors: [{ msg: "Invalid email or password" }] });
      }

      // Compare the provided password with the hashed password

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res
          .status(401)
          .json({ errors: [{ msg: "Invalid email or password" }] });
      }

      // Generate a JWT token
      req.user = user;
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ errors: [{ msg: "Server error during login" }] });
    }
    next();
  },
  mainController.signToken,
  (req, res) => {
    // Send the token to the frontend
    res.json({
      message: "logged in successfully",
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
      "Loren Ipsum",
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
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
      req.body.title,
      req.body.text,
      req.body.is_published,
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
      req.user.user_id,
      req.body.text,
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
    const updateComment = await db.updateComment(req.params.id, req.body.text);
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
