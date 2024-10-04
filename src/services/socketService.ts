import { Server } from "socket.io";
import chatSocket from "../sockets/chat";
import gameSocket from "../sockets/game";

class SocketService {
  private io: Server;
  private static _instance: SocketService | null = null;

  // Singleton pattern
  constructor(io: Server) {
    if (!SocketService._instance) {
      this.io = io;
      this._initialize();
      SocketService._instance = this;
    }
    return SocketService._instance;
  }

  static initialize(io: Server): SocketService {
    if (!SocketService._instance) {
      new SocketService(io);
    }
    return SocketService._instance;
  }

  static getInstance(): SocketService {
    if (!SocketService._instance) {
      throw new Error("SocketService has not been initialized!");
    }
    return SocketService._instance;
  }

  _initialize() {
    chatSocket(this.io); // chatMessage, systemMessage, joinRoom
    gameSocket(this.io); // turn management and other game events
  }

  emitToGameRoom(gameId: string, event: string, data: any) {
    this.io.to(gameId).emit(event, data);
  }
}

export default SocketService;

