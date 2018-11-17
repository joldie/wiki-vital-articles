"use strict";

const express = require("express");
const app = express();
const vitalArticles = require("../main.js");

app.get("/", async function(req, res) {
  const articles = await vitalArticles();
  res.setHeader("Content-Type", "application/json");
  res.send(articles);
});

app.listen(3000);
