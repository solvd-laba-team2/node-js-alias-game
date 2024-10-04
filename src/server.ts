import "dotenv/config";
import connectDB from "./config/mongoose";
import app from "./app";

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`The server is running on the port ${PORT}`);
});
