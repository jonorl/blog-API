const mainRouter = require("./mainRouter");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/", mainRouter);

request(app)
  .get('/api/v1/users')
  .expect('Content-Type', /json/)
  .expect('Content-Length', '1521')
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
  });
