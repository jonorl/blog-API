// Config

// Express setup
const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

// Router triggering
const mainRouter = require("./routes/mainRouter");
app.use("/", mainRouter);

// Passport / JWT setup

const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const db = require("./db/queries");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
};

// Create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await db.readUser(payload.sub);

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (err) {
    return done(err, false);
  }
});

passport.use(jwtLogin);
app.use(passport.initialize());

// Launch and port confirmation
app.listen(process.env.PORT, () =>
  console.log(`Listeining on port ${process.env.PORT}`)
);
