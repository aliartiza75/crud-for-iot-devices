var express = require("express");
var authRouter = require("./auth");
var deviceRouter = require("./device");
var feedRouter = require("./feed");

var app = express();

app.use("/auth/", authRouter);
app.use("/device/", deviceRouter);
app.use("/feed/", feedRouter);

module.exports = app;