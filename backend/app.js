// Config

const express = require("express");
const db = require("./queries");
const jwt = require("jsonwebtoken");
const app = express();

// Router

// GET routes

app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to the API",
  });
});

app.get("/api/userDetails/:id", async (req, res) => {
  const userPromise = db.readUser(req.params.id);
  const user = await userPromise;
  res.json({ message: "User details: ", user });
});

// POST routes

app.post("/api/createPost", async (req, res) => {
  // replace headers, placeholder data
  const postPromise = db.createPost(
    req.headers.user,
    "My second title",
    "something not so interesting...",
    true
  );
  const newPost = await postPromise;
  res.json({ message: "Blog posting successful", newPost });
});

app.put("/api/editPost", async (req, res) => {
  // replace headers, placeholder data
  const updatePromise = db.editPost(
    parseInt(req.headers.id),
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

app.post("/api/createUser", async (req, res) => {
  const newUserPromise = db.insertNewUser(
    // replace headers with body once form is created
    req.headers.firstname,
    req.headers.lastname,
    req.headers.email,
    req.headers.password
  );
  const newUser = await newUserPromise;
  res.json({ message: "New user created!: ", newUser });
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
