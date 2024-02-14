require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const app = express();
const dns = require('dns');
const url = require('url');


// Basic Configuration
const port = process.env.PORT;

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

const schemaUrl = new mongoose.Schema(
  {
    original: { type: String, required: true },
    short: { type: Number, required: true }
  }
);

const Url = mongoose.model('Url', schemaUrl);


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });


app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});


// Initialize the arrays to store URLs and corresponding short URLs
const Urls = [];
const shortUrl = [];

// Route for creating short URLs
app.post("/api/shorturl", (req, res) => {
    const url = req.body.url;
    const urlIndex = Urls.indexOf(url);

    // Check if the URL is valid
    if (!url.startsWith("https://") && !url.startsWith("http://")) {
        return res.json({ error: "Invalid URL" });
    }

    // If the URL is not already in the array, add it and generate a short URL
    if (urlIndex < 0) {
        Urls.push(url);
        shortUrl.push(shortUrl.length);
        return res.json({
            original_url: url,
            short_url: shortUrl.length - 1,
        });
    }

    // If the URL is already in the array, return its corresponding short URL
    return res.json({
        original_url: url,
        short_url: shortUrl[urlIndex],
    });
});


// Route for redirecting short URLs to original URLs
app.get("/api/shorturl/:url", (req, res) => {
    const url = parseInt(req.params.url);
    const indexFound = shortUrl.indexOf(url);

    // If the short URL is not found in the array, return an error
    if (indexFound < 0) {
        return res.json({ error: "No short URL found" });
    }

    // Redirect to the original URL corresponding to the short URL
    res.redirect(Urls[indexFound]);
});


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});