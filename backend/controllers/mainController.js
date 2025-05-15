const jwt = require("jsonwebtoken");

async function signToken(req, res, next) {
  const user = req.user;
  req.token = await jwt.sign(user, process.env.SECRET, { expiresIn: "7d" });
  next();
}

function verifyToken(req, res, next) {
  const bearerHeader = req.headers.authorization || req.params.id;
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    jwt.verify(req.token, process.env.SECRET, (err, authData) => {
      if (err) {
        console.log(err);
      } else {
        req.user = authData
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
