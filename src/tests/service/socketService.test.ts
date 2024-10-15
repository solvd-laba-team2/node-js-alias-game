import { Server } from "socket.io";
import SocketService from "../../services/socketService";
import chatSocket from "../../sockets/chat";
import gameSocket from "../../sockets/game";

jest.mock("socket.io");
jest.mock("../../sockets/chat");
jest.mock("../../sockets/game");

describe("SocketService", () => {
    let io: jest.Mocked<Server>;
    let socketService: SocketService;
    let toMock: jest.Mock;

    beforeEach(() => {
        toMock = jest.fn().mockReturnValue({
            emit: jest.fn(),
        });

        io = {
            to: toMock,
            emit: jest.fn(),
            on: jest.fn(),
        } as unknown as jest.Mocked<Server>;

        SocketService["_instance"] = null;

        socketService = SocketService.initialize(io);
    });

    it("should initialize the SocketService singleton", () => {
        const secondInstance = SocketService.initialize(io);
        expect(secondInstance).toBe(socketService);
    });

    it("should throw an error if SocketService is accessed without initialization", () => {
        SocketService["_instance"] = null;
        expect(() => SocketService.getInstance()).toThrowError(
            "SocketService has not been initialized!"
        );
    });

    it("should emit an event to a specific game room", () => {
        const gameId = "game123";
        const event = "gameEvent";
        const data = { message: "Game started" };

        socketService.emitToGameRoom(gameId, event, data);

        expect(io.to).toHaveBeenCalledWith(gameId);
        expect(toMock().emit).toHaveBeenCalledWith(event, data);
    });

    it("should emit an event to a specific socket", () => {
        const socketId = "socket123";
        const event = "privateMessage";
        const data = { message: "Hello" };

        socketService.emitToSocket(socketId, event, data);

        expect(io.to).toHaveBeenCalledWith(socketId);
        expect(toMock().emit).toHaveBeenCalledWith(event, data);
    });

    it("should emit a global event", () => {
        const event = "globalEvent";
        const data = { message: "System maintenance" };

        socketService.emit(event, data);
        expect(io.emit).toHaveBeenCalledWith(event, data);
    });
});
