import http, { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { Application } from "express";
import SocketService from "../services/socketService";

export default (app: Application): HttpServer => {
  const server = http.createServer(app);
  const io = new Server(server);
  new SocketService(io);
  return server;
};
