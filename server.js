const mongoose = require("mongoose");
const config = require("./src/config");
const app = require("./src/app");

async function start() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("MongoDB connected");
    const port = config.PORT;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
}

start();