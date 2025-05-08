const jwt = require("jsonwebtoken");

async function signToken(req, res) {
  const user = req.user;
  token = await jwt.sign(user, process.env.SECRET, { expiresIn: "7d" });
  //   localStorage.setItem("authtoken", token);
  res.json({ message: "New user created!: ", user, token });
}

function verifyToken(req, res, next) {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    jwt.verify(req.token, process.env.SECRET, (err, authData) => {
      if (err) {
        console.log(err)
      } else {
        console.log(authData);
      }
    });
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = {
  signToken,
  verifyToken,
};
