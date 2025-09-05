import dotenv from "dotenv";
dotenv.config({ path: "./env" });

import app from "./src/app.js";
import routes from "./src/routes/route.js";

const PORT = process.env.PORT || 3000;

// Handle uncaught exceptions (sync errors like undefined variable)
process.on("uncaughtException", (err) => {
  console.error(" UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
// Force an uncaught exception

//  Server start & store instance
const server = app.listen(PORT, () => {
  console.log(` Server is running on port: ${PORT}`);
});


app.use(routes);

// Handle unhandled promise rejections (async errors like DB fail)
process.on("unhandledRejection", (err) => {
  console.error(" UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);

  // Gracefully close server before exiting
  server.close(() => {
    process.exit(1);
  });
});
