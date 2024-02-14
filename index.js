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


// Initialize the arrays to store longUrl and corresponding short longUrl
const longUrl = [];
const shortUrl = [];

// Route for creating short longUrl
app.post("/api/shorturl", async (req, res) => {
    const url = req.body.url;
    const urlIndex = longUrl.indexOf(url);

    // Check if the URL is valid
    if (!url.startsWith("https://") && !url.startsWith("http://")) {
        return res.json({ error: "Invalid URL" });
    }

    // If the URL is not already in the array, add it and generate a short URL
    if (urlIndex < 0) {
        longUrl.push(url);
        shortUrl.push(shortUrl.length);

        // Write each URL to the database
        try {
          for (let i = 0; i < longUrl.length; i++) {
              await Url.create({ original: longUrl[i], short: i + 1 });
          }
          console.log("Urls written to the database.");
          } catch (error) {
            console.error("Error writing urls to the database:", error);
            return res.status(500).json({ error: "Internal Server Error" });
          }

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


// Route for redirecting short longUrl to original longUrl
app.get("/api/shorturl/:url", (req, res) => {
    const url = parseInt(req.params.url);
    const indexFound = shortUrl.indexOf(url);

    // If the short URL is not found in the array, return an error
    if (indexFound < 0) {
        return res.json({ error: "No short URL found" });
    }

    // Redirect to the original URL corresponding to the short URL
    res.redirect(longUrl[indexFound]);
});



// function verifyUrl(submittedUrl, callback) {
//   try {
//     const parsedUrl = new URL(submittedUrl);
//     const hostname = parsedUrl.hostname;
    
//     dns.lookup(hostname, (err, address, family) => {
//       if (err) {
//         callback(err);
//       } else {
//         callback(null, { hostname, address, family });
//       }
//     });
//   } catch (error) {
//     callback(error);
//   }
// }


// const submittedUrl = 'https://www.freecodecamp.org/learn/back-end-development-and-apis/back-end-development-and-apis-projects/url-shortener-microservice';

// verifyUrl(submittedUrl, (err, result) => {
//   if (err) {
//     console.error('Error:', err.message);
//   } else {
//     console.log('Verified URL:', result);
//   }
// });


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});