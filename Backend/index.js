import dotenv from "dotenv";
dotenv.config({ path: "./env" });
import app from "./src/app.js";
import routes from "./src/routes/route.js";

const PORT = process.env.PORT || 3000;

//Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

//Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

app.listen(PORT, () => console.log(`Server Is Running On Port: ${PORT}`));
app.use(routes);
