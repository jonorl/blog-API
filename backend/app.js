// Config

const express = require("express");
const db = require("./queries");
const jwt = require("jsonwebtoken");
const app = express();

// Router

// User Routes

// Get all users
app.get("/api/v1/users", async (req, res) => {
  const getUsersPromise = db.getAllUsers();
  const getUsers = await getUsersPromise;
  res.json({ message: "List of all users: ", getUsers });
});

// Get user by ID
app.get("/api/v1/users/:id", async (req, res) => {
  const user = await db.readUser(req.params.id);
  res.json({ message: "User details: ", user });
});

// Create new user
app.post("/api/v1/users", async (req, res) => {
  const newUser = await db.insertNewUser(
    // replace headers with body once form is created
    req.headers.firstname,
    req.headers.lastname,
    req.headers.email,
    req.headers.password
  );
  res.json({ message: "New user created!: ", newUser });
});
// Update a user
app.put("/api/v1/users/:id", async (req, res) => {
  const editUser = await db.updateUser(
    req.params.id,
    req.headers.firstname,
    req.headers.lastname,
    req.headers.email
  );
  res.json({ message: "User updated successfully!", editUser });
});

// Delete a user
app.delete("/api/v1/users/:id", async (req, res) => {
  const deleteUser = await db.deleteUser(req.params.id);
  res.json({ message: "User deleted successfully", deleteUser });
});

// Post Routes
app.get("/api/v1/posts", async (req, res) => {
  /* Get all posts */
});
app.get("/api/v1/posts/:id", async (req, res) => {
  /* Get post by ID */
});
app.post("/api/v1/posts", async (req, res) => {
  const postPromise = db.createPost(
    req.headers.user,
    "My second title",
    "something not so interesting...",
    true
  );
  const newPost = await postPromise;
  res.json({ message: "Blog posting successful", newPost });
});
app.put("/api/v1/posts/:id", async (req, res) => {
  const updatePromise = db.editPost(
    req.params.id,
    "Just 2nd Title",
    "Something a bit more interesting",
    false
  );
  const update = await updatePromise;
  res.json({
    message: "Post edited successufly",
    update,
  });
});
app.delete("/api/v1/posts/:id", async (req, res) => {
  const deletePostPromise = db.deletePost(req.headers.id);
  const deletePost = await deletePostPromise;
  res.json({ message: "Post deleted successfuly", deletePost });
});

// Comments (as a sub-resource of posts)
app.get("/api/v1/posts/:postId/comments", async (req, res) => {
  /* Get comments for a post */
});
app.post("/api/v1/posts/:postId/comments", async (req, res) => {
  /* Add a comment to a post */
});
app.get("/api/v1/comments/:id", async (req, res) => {
  /* Get a specific comment */
});
app.put("/api/v1/comments/:id", async (req, res) => {
  /* Update a comment */
});
app.delete("/api/v1/comments/:id", async (req, res) => {
  /* Delete a comment */
});

// Sample tutorial

app.post("/api/login", (req, res) => {
  const user = {
    id: 1,
    username: "Jon",
    email: "jon@orlo.com",
  };
  jwt.sign(
    {
      user,
    },
    process.env.SECRET,
    { expiresIn: "30s" },
    (err, token) => {
      res.json({
        token,
      });
    }
  );
});

app.post("/api/posts", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({ message: "post created", authData });
    }
  });
});

// Controllers

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

app.listen(process.env.PORT, () => console.log("Listeining on port 3000"));
