const express = require("express");
const db = require("./queries");
const jwt = require("jsonwebtoken");

const app = express();

app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to the API",
  });
});

app.post("/api/posts", verifyToken, (req, res) => {
  jwt.verify(req.token, "secreto", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({ message: "post created", authData });
    }
  });
});

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
    "secreto",
    { expiresIn: "30s" },
    (err, token) => {
      res.json({
        token,
      });
    }
  );
});

app.get("/api/userDetails/:id", (req, res) => {
  const user = db.readUser(req.params.id);
  res.json({ message: "User details: ", user });
});

app.post("/api/createUser", async (req, res) => {
  const newUserPromise = db.insertNewUser(req.headers.firstname, req.headers.lastname, req.headers.email, req.headers.password);
  const newUser = await newUserPromise
  res.json({ message: "New user created!: ", newUser });
});

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

app.listen(3000, () => console.log("Listeining on port 3000"));
