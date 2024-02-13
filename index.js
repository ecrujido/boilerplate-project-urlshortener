require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint
app.get("/api/shorturl/:input", async (req, res) => {
  try {
      const input = parseInt(req.params.input);
      const data = await Url.findOne({ short: input }).exec();
      if (!data) return res.json("URL NOT FOUND");
      return res.redirect(data.original);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


// Create short URL
app.post("/api/shorturl", async (req, res) => {
  try {
      const bodyUrl = req.body.url;
      const urlRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/);

      if (!bodyUrl.match(urlRegex)) {
          return res.status(400).json({ error: "Invalid URL" });
      }

      let index = 1;

      const data = await Url.findOne({}).sort({ short: 'desc' }).exec();
      index = data !== null ? data.short + 1 : index;

      const newUrl = await Url.findOneAndUpdate(
          { original: bodyUrl },
          { original: bodyUrl, short: index },
          { new: true, upsert: true }
      ).exec();

      res.json({ original_url: bodyUrl, short_url: newUrl.short });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});








app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
