
# Alias Game API

This API is designed for the Alias game, a multiplayer word-guessing game where players form teams, describe words, and guess them within a time limit. The API handles user authentication, game rooms, gameplay mechanics, chat functionality, and score tracking.

## Project Structure

```
alias-game-api/
│
├── controllers/
│   ├── authController.js        # Authentication and login
│   ├── gameController.js        # Game logic (rooms, gameplay)
│   ├── chatController.js        # Game chat functionality
│   └── scoreController.js       # Scores and statistics
│
├── models/
│   ├── userModel.js             # User model
│   ├── gameModel.js             # Game model (rooms, players)
│   ├── chatModel.js             # Chat model
│   └── scoreModel.js            # Scores model
│
├── routes/
│   ├── authRoutes.js            # Authentication routes
│   ├── gameRoutes.js            # Game routes
│   ├── chatRoutes.js            # Chat routes
│   └── scoreRoutes.js           # Score routes
│
├── config/
│   ├── database.js              # Database configuration
│   ├── middleware.js            # Middleware (e.g., JWT authentication)
│   └── routes.js                # Combining all routes
│
├── server.js                    # Server entry point
├── package.json                 # Project dependencies
└── .env                         # Environment variables (e.g., JWT keys, database URL)
```

## API Endpoints

### 1. **Authentication (Auth)**:
- **POST** `/auth/register`: Register a new user.
- **POST** `/auth/login`: Log in and receive a JWT token.

### 2. **Game Rooms**:
- **POST** `/game/rooms`: Create a new game room.
- **GET** `/game/rooms`: Retrieve a list of available game rooms.
- **POST** `/game/rooms/:roomId/join`: Join an existing game room.
- **POST** `/game/rooms/:roomId/start`: Start a game in the room.
- **DELETE** `/game/rooms/:roomId`: Delete a game room (only by the owner).

### 3. **Chat**:
- **GET** `/chat/rooms/:roomId`: Retrieve chat history for a game room.
- **POST** `/chat/rooms/:roomId`: Send a message to the game room's chat.

### 4. **Gameplay**:
- **POST** `/game/:roomId/turn/start`: Start a new turn for the team.
- **POST** `/game/:roomId/turn/end`: End the current turn.
- **GET** `/game/:roomId/word`: Retrieve a word for the player to describe.
- **POST** `/game/:roomId/guess`: Submit a guess from a team.

### 5. **Scores**:
- **GET** `/game/:roomId/scores`: Retrieve the game scores for the room.
- **POST** `/game/:roomId/scores`: Submit scores after the game ends.

## Sample API Endpoints

### 1. **Register a User** (`/auth/register`)
- **Method**: POST
- **Body**:
    ```json
    {
      "username": "player1",
      "email": "player1@example.com",
      "password": "password123"
    }
    ```
- **Response**:
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "id": "userId123",
        "username": "player1",
        "email": "player1@example.com"
      }
    }
    ```

### 2. **Create a Game Room** (`/game/rooms`)
- **Method**: POST
- **Body**:
    ```json
    {
      "roomName": "Room 1",
      "maxPlayers": 4
    }
    ```
- **Response**:
    ```json
    {
      "message": "Room created successfully",
      "room": {
        "id": "roomId123",
        "roomName": "Room 1",
        "maxPlayers": 4,
        "players": []
      }
    }
    ```

### 3. **Retrieve Game Room List** (`/game/rooms`)
- **Method**: GET
- **Response**:
    ```json
    [
      {
        "id": "roomId123",
        "roomName": "Room 1",
        "maxPlayers": 4,
        "players": 3
      },
      {
        "id": "roomId456",
        "roomName": "Room 2",
        "maxPlayers": 6,
        "players": 2
      }
    ]
    ```

### 4. **Start a Game Turn** (`/game/:roomId/turn/start`)
- **Method**: POST
- **Response**:
    ```json
    {
      "message": "Turn started for team",
      "word": "apple",
      "timeLimit": 60
    }
    ```

### 5. **Submit a Guess** (`/game/:roomId/guess`)
- **Method**: POST
- **Body**:
    ```json
    {
      "guess": "banana"
    }
    ```
- **Response**:
    ```json
    {
      "correct": false,
      "message": "Incorrect guess, try again!"
    }
    ```

### 6. **Submit Game Scores** (`/game/:roomId/scores`)
- **Method**: POST
- **Body**:
    ```json
    {
      "team1Score": 15,
      "team2Score": 12
    }
    ```
- **Response**:
    ```json
    {
      "message": "Scores saved successfully"
    }
    ```

## Authentication and Authorization (JWT)

To secure the endpoints, such as creating a game room, making guesses, or sending chat messages, JWT authentication is implemented. Users need to log in to obtain a JWT token, which must be passed in the headers for accessing protected endpoints.

```http
Authorization: Bearer <token>
```

## Environment Variables (`.env`)

Make sure to configure the following environment variables in your `.env` file:
```
JWT_SECRET=your_jwt_secret_key
DB_URL=your_mongodb_connection_url
```

## How to Run the Project

1. Clone the repository.
2. Install the dependencies:
    ```bash
    npm install
    ```
3. Set up your `.env` file with the necessary environment variables.
4. Start the server:
    ```bash
    npm start
    ```

## Future Improvements
- Add more robust error handling.
- Implement user statistics and leaderboards.
- Add WebSocket support for real-time chat and game updates.

