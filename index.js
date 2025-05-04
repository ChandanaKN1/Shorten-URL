const express = require("express");
const { connectToMongoDB } = require('./connect'); // ✅ Connect helper
const urlRoute = require("./routes/url");
const URL = require('./models/url'); // ✅ Your Mongoose model

const app = express();
const port = 8001;

// Connect to MongoDB
connectToMongoDB("mongodb://127.0.0.1:27017/short-url")
  .then(() => {
    console.log("MongoDB connected ✅");

    app.use(express.json());

    // Route to create short URL
    app.use("/url", urlRoute);

    // Route to handle short URL redirect
    app.get('/:shortId', async (req, res) => {
      const shortId = req.params.shortId;

      try {
        const entry = await URL.findOneAndUpdate(
          { shortId },
          {
            $push: {
              visitHistory: {
                timestamps: Date.now(),
              },
            },
          }
        );

        // If shortId not found
        if (!entry) {
          return res.status(404).send("❌ Short URL not found!");
        }

        // Redirect to original URL
        res.redirect(entry.redirectURL);
      } catch (err) {
        console.error("Error during redirect:", err);
        res.status(500).send("🚨 Server Error");
      }
    });

    app.listen(port, () => console.log(`🚀 Server started at http://localhost:${port}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
