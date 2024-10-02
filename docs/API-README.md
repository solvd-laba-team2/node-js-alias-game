
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
#### **POST** `api/v1/auth/register`: Register a new user.
Request:
```bash
curl -X 'POST' \
'auth/register' \
-H 'Content-Type: application/json' \
-d '{
    "username": "username",
    "password": "password"
}'
```
Responses:
- Success 
```http
HTTP/1.1 201 Created
Set-Cookie: token=<jwt_token>; Path=/; HttpOnly
Location: /
```
- Server error
```http
HTTP/1.1 500 Internal Server Error
Content-Type: text/html

{
    "title": "Register",
    "page": "register",
    "errorMessage": "Internal server error"
}
```
- Client error:
```http
HTTP/1.1 409 Conflict
Content-Type: text/html

{
    "title": "Register",
    "page": "register",
    "errorMessage": "Username already exists"
}
```

#### **POST** `api/v1/auth/login`: Log in and receive a JWT token.
Request:
```bash
curl -X 'POST' \
'auth/login' \
-H 'Content-Type: application/json' \
-d '{
    "username": "username",
    "password": "password"
}'
```
Responses:
- Success 
```http
HTTP/1.1 200 OK
Set-Cookie: token=<jwt_token>; Path=/; HttpOnly
Location: /
```
- Server error
```http
HTTP/1.1 500 Internal Server Error
Content-Type: text/html

{
    "title": "Login",
    "page": "login",
    "errorMessage": "Internal server error"
}
```
- Client error:
```http
HTTP/1.1 409 Conflict
Content-Type: text/html

{
    "title": "Login",
    "page": "login",
    "errorMessage": "Username already exists"
}
```


### 2. **Game Rooms**:
#### **POST** `api/v1/rooms`: Create a new game room.
  Request:
  ```bash
curl -X 'POST' \
'rooms' \
-H 'Content-Type: application/json' \
-d '{
  "roomName": "Room123",
  "team1": {
    "players": []
  },
  "team2": {
    "players": []
  }
}'
```
Response:
  ```json
  {
    "success": true,
    "message": "Game room created successfully.",
    "room": {
      "id": "613b6a24f9345f0012eeb58c",
      "status": "creating",
      "team1": {
        "players": ["player1", "player2"],
        "chatID": "61ad4d9b2d1b4d7e2e7659cb",
        "score": []
      },
      "team2": {
        "players": ["player3", "player4"],
        "chatID": "61ad4d9b2d1b4d7e2e7659cc",
        "score": []
      },
      "createdAt": "2023-09-29T18:00:00.000Z"
    }
  }
```
Status codes:
 - 201 Created
 - 401 Unauthorized
 - 500 Internal Server Error
#### **GET** `api/v1/rooms`: Retrieve a list of available game rooms.
Request:
```bash
curl -X 'GET' \
'rooms' \
-H 'Authorization: Bearer jwt_token_here'
```
Response:
```json
{
  "success": true,
  "rooms": [
    {
      "id": "613b6a24f9345f0012eeb58c",
      "status": "creating",
      "team1": {
        "players": ["player1", "player2"],
        "score": []
      },
      "team2": {
        "players": ["player3", "player4"],
        "score": []
      },
      "createdAt": "2023-09-29T18:00:00.000Z"
    }
  ]
}
```
Status codes:
 - 200 OK
 - 401 Unauthorized
 - 500 Internal Server Error
#### **POST** `api/v1/rooms/:roomId/join`: Join an existing game room.
Request:
 ```bash
curl -X 'POST' \
'rooms/:roomId/join' \
-H 'Content-Type: application/json' \
-d '{
  "username": "player5"
}
'
```
Response:
```json
{
  "success": true,
  "room": {
    "id": "613b6a24f9345f0012eeb58c",
    "status": "playing",
    "team1": {
      "players": [],
      "score": []
    },
    "team2": {
      "players": [],
      "score": []
    }
  }
}
```

Status codes:
 - 200 OK
 - 401 Unauthorized
 - 404 Not Found
 - 500 Internal Server Error
Response: 
#### **POST** `api/v1/rooms/:roomId/:team/join`: Join team in game room.
Request:
 ```bash
curl -X 'POST' \
'rooms/:roomId/join' \
-H 'Content-Type: application/json' \
-d '{
  "username": "player5",
  "team": "team1"
}
'
```
Response:
```json
{
  "success": true,
  "room": {
    "id": "613b6a24f9345f0012eeb58c",
    "status": "playing",
    "team1": {
      "players": ["player1", "player2"],
      "score": []
    },
    "team2": {
      "players": ["player3", "player4"],
      "score": []
    }
  }
}
```

Status codes:
 - 200 OK
 - 401 Unauthorized
 - 404 Not Found
 - 500 Internal Server Error
#### **POST** `api/v1/game/rooms/:roomId/start`: Start a game in the room.
Request: 
```bash
curl -X 'POST' \
'game/rooms/:roomId/start' \
-H 'Authorization: Bearer jwt_token_here'
```
Response: 
```json
{
  "success": true,
  "message": "Game started.",
  "room": {
    "id": "613b6a24f9345f0012eeb58c",
    "status": "playing",
    "team1": {
      "players": ["player1", "player2"],
      "score": []
    },
    "team2": {
      "players": ["player3", "player4"],
      "score": []
    }
  }
}
```
Status codes:
 - 200 OK
 - 401 Unauthorized
 - 404 Not Found
 - 500 Internal Server Error
#### **DELETE** `api/v1/rooms/:roomId`: Delete a game room (only by the owner).
Request:
```bash
curl -X 'DELETE' \
'rooms/:roomId' \
-H 'Authorization: Bearer jwt_token_here'
```
Response:
```json
{
  "success": true,
  "message": "Game room deleted successfully."
}
```
Status codes:
 - 200 OK
 - 401 Unauthorized
 - 404 Not Found
 - 500 Internal Server Error

### 3. **Chat**:
#### **GET** `api/v1/chat/rooms/:roomId`: Retrieve chat history for a game room.
Request:
```bash
curl -X 'GET' \
'chat/rooms/:roomId' \
-H 'Authorization: Bearer jwt_token_here'
```
Response:
```json
{
  "id": "roomId",
  "messages": [
    {
      "timestamp": "2024-10-01T12:34:56Z",
      "sender": "user1",
      "type": "description",
      "content": "football"
    },
    {
      "timestamp": "2024-10-01T12:35:01Z",
      "sender": "user2",
      "type": "message",
      "content": "goal"
    },
    {
      "timestamp": "2024-10-01T12:35:10Z",
      "sender": "user3",
      "type": "message",
      "content": "stadium"
    }
  ]
}
```

Status codes:
 - 200 OK
 - 401 Unauthorized
 - 404 Not Found
 - 500 Internal Server Error

#### **POST** `api/v1/chat/rooms/:roomId`: Send a message to the game room's chat.
Request:
```bash
curl -X 'GET' \
'chat/rooms/:roomId' \
-H 'Authorization: Bearer jwt_token_here''

{
  "timestamp": "2024-10-01T12:34:56Z",
  "sender": "user1",
  "type": "description",
  "content": "football"
}
```
Response:
```json
{
  "message": "Success"
}
```

Status codes:
 - 200 OK
 - 401 Unauthorized
 - 404 Not Found
 - 500 Internal Server Error
### 4. **Gameplay**:
#### **POST** `api/v1/game/:roomId/turn/start`: Start a new turn for the team.
Request: 
```bash
curl -X 'POST' \
'game/:roomId/turn/start' \
-H 'Authorization: Bearer jwt_token_here'

{
  "team": "team1"
}
```
Response:
```json
{
  "success": true,
  "message": "Turn started for team1"
}
```

Status codes:
 - 200 OK
 - 401 Unauthorized
 - 404 Not Found
 - 500 Internal Server Error
#### **POST** `api/v1/game/:roomId/turn/end`: End the current turn.
Request:
```bash
curl -X 'POST' \
'game/:roomId/turn/end' \
-H 'Authorization: Bearer jwt_token_here'

{
  "team": "team1"
}
```
Response:
```json
{
  "success": true,
  "message": "Turn ended",
}
```
Status codes:
 - 200 OK
 - 401 Unauthorized
 - 404 Not Found
 - 500 Internal Server Error
#### **GET** `api/v1/game/:roomId/word`: Retrieve a word for the player to describe.
Request: 
```bash
curl -X 'GET' \
'game/:roomId/word' \
-H 'Authorization: Bearer jwt_token_here'

{
  "category": ["noun","adjective"],
  "length": {min = number, max = number}
}
```
Response:
```json
{
  "success": true,
  "word": "elephant"
}
```
Status codes:
 - 200 OK
 - 401 Unauthorized
 - 404 Not Found
 - 500 Internal Server Error
#### **POST** `api/v1/game/:roomId/guess`: Submit a guess from a team.
Request: 
```bash
curl -X 'POST' \
'game/:roomId/guess' \
-H 'Authorization: Bearer jwt_token_here' \
-d '{
      "team": "team1",
      "word": "elephant"
    }'
```
Response: 
```json
{
  "success": true,
  "correct": Boolean,
  "message": "Message if correct or not" 
}
```
Status codes:
 - 200 OK
 - 401 Unauthorized
 - 404 Not Found
 - 500 Internal Server Error
### 5. **Scores**:
#### **GET** `api/v1/game/:roomId/scores`: Retrieve the game scores for the room.
Request:
```bash
curl -X 'GET' \
'game/:roomId/scores' \
-H 'Authorization: Bearer jwt_token_here'
```
Response:
```json
{
  "success": true,
  "scores": {
    "team1": {
      "players": ["player1", "player2"],
      "score": [
        { "word": "apple", "status": "guessed" },
        { "word": "banana", "status": "not guessed" }
      ]
    },
    "team2": {
      "players": ["player3", "player4"],
      "score": [
        { "word": "orange", "status": "guessed" },
        { "word": "grape", "status": "not guessed" }
      ]
    }
  }
}
```
Status codes:
 - 200 OK
 - 401 Unauthorized
 - 404 Not Found
 - 500 Internal Server Error
#### **POST** `api/v1/game/:roomId/scores`: Submit scores after the game ends. 
Request:
```bash
curl -X 'POST' \
'game/:roomId/scores' \
-H 'Authorization: Bearer jwt_token_here' \
-d '{
      "team1": {
        "guessedWords": ["apple", "orange"],
        "score": 2
      },
      "team2": {
        "guessedWords": ["grape"],
        "score": 1
      }
    }'
```
Response: 
```json
{
  "success": true,
  "message": "Scores updated",
  "finalScores": {
    "team1": 2,
    "team2": 1
  }
}
```
Status codes:
 - 200 OK
 - 401 Unauthorized
 - 404 Not Found
 - 500 Internal Server Error

## Sample API Endpoints

### 1. **Register a User** (`/auth/register`)
- **Method**: POST
- **Body**:
    ```json
    {
      "username": "player1",
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

## Models
### User Model

| Field         | Type   | Required                    | Default   | Additional Information      |
|---------------|--------|-----------------------------|-----------|-----------------------------|
| `username`    | String | Yes, 'Please enter username' | None      |                             |
| `password`    | String | Yes, 'Please enter password' | None      |                             |
| `gamesPlayed` | Number | Yes                         | 0         | Inside `stats` field        |
| `gamesWon`    | Number | Yes                         | 0         | Inside `stats` field        |
| `wordsGuessed`| Number | Yes                         | 0         | Inside `stats` field        |
| `createdAt`   | Date   | No                          | Date.now  |                             |

### Game Model

| Field       | Type      | Required | Default    | Additional Information            |
|-------------|-----------|----------|------------|-----------------------------------|
| `status`    | String    | No       | 'creating' | Enum: ['creating', 'playing', 'finished'] |
| `team1`     | TeamSchema| No       | {}         | Contains players, chatID, and score |
| `team2`     | TeamSchema| No       | {}         | Contains players, chatID, and score |
| `wonTeamId` | String    | No       | None       |                                   |
| `createdAt` | Date      | No       | Date.now   |                                   |

### TeamSchema (inside Game)

| Field    | Type               | Required | Default | Additional Information       |
|----------|--------------------|----------|---------|------------------------------|
| `players`| Array of Strings   | No       | []      | Players' usernames            |
| `chatID` | String             | No       | None    | Chat ID                       |
| `score`  | Array of ScoreSchema| No       | []      | Contains word, status, guessed|

### ScoreSchema (inside Team)

| Field     | Type   | Required | Default   | Additional Information        |
|-----------|--------|----------|-----------|-------------------------------|
| `word`    | String | No       | None      |                               |
| `status`  | String | No       | None      | Enum: ['guessed', 'not guessed'] |
| `guessed` | String | No       | 'nobody'  | Who guessed the word          |

### Chat Model

| Field      | Type              | Required | Default   | Additional Information        |
|------------|-------------------|----------|-----------|-------------------------------|
| `messages` | Array of Messages | No       | []        | Contains message details      |

### MessageSchema (inside Chat)

| Field       | Type   | Required | Default   | Additional Information        |
|-------------|--------|----------|-----------|-------------------------------|
| `timestamp` | Date   | No       | Date.now  |                               |
| `sender`    | String | Yes      | None      | Username of the message sender|
| `type`      | String | Yes      | None      | Enum: ['description', 'message'] |
| `content`   | String | Yes      | None      | Message content               |

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

