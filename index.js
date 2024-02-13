require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  console.log(e);
}
const bodyParser = require('body-parser');
const router = express.Router();
const shortId = require('shortid')
const validator = require('validator');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cors());

console.log(process.env.MONGO_URI);

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
});


const schema = new mongoose.Schema(
    {
        original: { type: String, required: true },
        short: { type: Number, required: true }
    }
);


const Url = mongoose.model('Url', schema);

app.use(bodyParser.urlencoded({
  extended: true
}));


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});


const urlMappings = new Map(); // Using Map to store original and shortened URLs


function isValidUrl(url) {
  const urlRegex = /^(https?):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
  return urlRegex.test(url);
}


app.post("/api/shorturl", (req, res) => {
  const inputForm = req.body.url;

  // Check if the input URL is valid
  if (isValidUrl(inputForm)) {
    if (!urlMappings.has(inputForm)) {
      const shortUrl = urlMappings.size; // Short URL is the index of the mapping
      urlMappings.set(inputForm, shortUrl);

      return res.json({
        original_url: inputForm,
        short_url: shortUrl
      });
    } else {
      const shortUrl = urlMappings.get(inputForm);
      return res.json({
        original_url: inputForm,
        short_url: shortUrl
      });
    }
  } else {
    return res.json({ error: "Invalid URL" });
  }
});


app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  if (urlMappings.has(shortUrl)) {
    const originalUrl = Array.from(urlMappings.entries()).find(entry => entry[1] === shortUrl)[0];
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: "No short URL found for the given input" });
  }
});




app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});