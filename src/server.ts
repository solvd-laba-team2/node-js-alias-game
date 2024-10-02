import "dotenv/config";
import app from "./app";
import connectDB from "./config/mongoose";

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`The server is running on the port ${PORT}`);
});
