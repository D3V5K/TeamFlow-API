const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");
const connectDB = require("./config/db");

const requiredEnvVars = ["JWT_SECRET", "JWT_REFRESH_SECRET", "MONGODB_URI"];
const missing = requiredEnvVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();