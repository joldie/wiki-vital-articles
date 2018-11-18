"use strict";

const express = require("express");
const app = express();
const cors = require("cors");
const vitalArticles = require("../main.js");

// Enable CORS for all origins
app.use(cors());

app.get("/", async function(req, res) {
  // Get list of articles by scraping Wikipedia webpage
  const articles = await vitalArticles();
  // Set headers and send JSON object containing all articles
  res.setHeader("Content-Type", "application/json");
  res.send(articles);
});

app.listen(3000);
