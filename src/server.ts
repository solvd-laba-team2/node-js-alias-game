import "dotenv/config";
import app from "./app";
import connectDB from "./config/mongoose";
import http from "http";
import { initializeSocket } from "./config/socket.io";  
import GameService from "./services/gameService";  // Import GameService

connectDB();

const server = http.createServer(app);
const gameService = new GameService();  
initializeSocket(server, gameService);  

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`The server is running on the port ${PORT}`);
});
