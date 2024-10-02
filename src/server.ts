import "dotenv/config";
import app from "./app";
import connectDB from "./config/mongoose";
import { Server } from "socket.io";
import chatSocket from "./sockets/chat";
import http from "http";

connectDB();

const server = http.createServer(app);
const io = new Server(server);

chatSocket(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`The server is running on the port ${PORT}`);
});
