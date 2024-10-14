
# Alias Game API

This API is designed for the Alias game, a multiplayer word-guessing game where players form teams, describe words, and guess them within a time limit. The API handles user authentication, game rooms, gameplay mechanics, chat functionality, and score tracking.

## Project Structure

```md

src/
├── config/
│   ├── handlebars.ts
│   ├── middleware.ts
│   ├── mongoose.ts
│   ├── routes.ts
│   └── socket.ts
│
├── controllers/
│   ├── authController.ts
│   ├── gameController.ts
│   └── userController.ts
│
├── middleware/
│   ├── checkAuth.ts
│   └── verifyToken.ts
│
├── models/
│   ├── chatModel.ts
│   ├── gameModel.ts
│   └── userModel.ts
│
├── public/
│   └─ assets/
│       ├── css/
|       |    └── styles.css
│       └── js/
│           ├── elementsDisplay.js
│           ├── formValidation.js
│           ├── handlers.js
│           ├── joining-room.js
│           ├── listeners.js
│           ├── loadData.js
│           └── socket.io.js    
│
├── routes/
│   ├── authRoutes.ts
│   ├── gameRoutes.ts
│   └── userRoutes.ts
│
├── services/
│   ├── chatService.ts
│   ├── gameLogicService.ts
│   ├── gameService.ts
│   └── socketService.ts
│
├── sockets/
│   ├── handlers/
│   │   ├── chatHandlers.ts
│   │   └── gameHandlers.ts
│   ├── chat.ts
│   └── game.ts
│
├── types/
│   └── chatSocket.types.ts
│
├── utils/
│   ├── hash.ts
│   ├── randomWords.ts
│   └── wordCheck.ts
│
├── views/
│
├── app.ts
└── server.ts

```

## API Endpoints

### Auth Endpoints

#### 1. **GET** `/login` - Render Login Page

- **Description:** Displays the login page for the user.
- **Response:**
  - Renders the login page with a form to submit login credentials.
  
---

#### 2. **GET** `/register` - Render Register Page

- **Description:** Displays the registration page for the user.
- **Response:**
  - Renders the registration page with a form to create a new account.

---

#### 3. **POST** `/login` - User Login

- **Description:** Logs in the user by verifying credentials and creating a JWT token.
- **Request Body:**
  - `username`: string (required)
  - `password`: string (required)
  
- **Response:**
  - **200 OK**: Redirects to the home page on successful login.
  - **400 Bad Request**: If the username or password is incorrect, renders the login page with an error message.
  - **500 Internal Server Error**: If something went wrong on the server side.
  
- **Example:**

  ```json
  {
    "username": "johndoe",
    "password": "yourpassword"
  }
  ```

---

#### 4. **POST** `/register` - User Registration

- **Description:** Registers a new user by creating a new user record and generating a JWT token.
- **Request Body:**
  - `username`: string (required)
  - `password`: string (required)
  
- **Response:**
  - **200 OK**: Redirects to the home page upon successful registration.
  - **400 Bad Request**: If the username already exists, renders the registration page with an error message.
  - **500 Internal Server Error**: If something went wrong during the registration process.

---

#### 5. **GET** `/logout` - User Logout

- **Description:** Logs out current user and clears out the JWT token
- **Request Body:**
  - No request body
  
- **Response:**
  - **200 OK**: Redirects to the home page upon successful logout with no token (unauthenticated).

### User Endpoints

#### 1. **POST** `/user` - Create a New User

- **Description:** Creates a new user by saving the user information in the database.
- **Request Body:**
  - `username`: string (required)
  - `password`: string (required)
  
- **Response:**
  - **200 OK**: The user is successfully created.
  - **500 Internal Server Error**: If something went wrong during user creation.

- **Example Rrequest Body:**

  ```json
  {
    "username": "johndoe",
    "password": "yourpassword"
  }
  ```

- **Example Response:**

  ```json
  {
    "username": "johndoe",
    "stats": {
        "gamesPlayed": 0,
        "gamesWon": 0,
        "wordsGuessed": 0
    }
  }
  ```

#### 2. **GET** `/user` - Get User Data

- **Description:** Fetches user data from the database by `username` kept in the session and renders user profile page.
- **Request Body:**
  - No request body

- **Response:**
  - **200 OK**: Renders user profile page.
  - **500 Internal Server Error**: If something went wrong on the server.

#### 3. **PUT** `/user` - Update User Password

- **Description:** Updates the password for the authenticated user.
- **Request Body:**
  - `password`: string (required); the new password to be set.

- **Response:**
  - **200 OK**: If the password was successfully updated.
  - **401 Not Found**: Renders the login page with no error message.
  - **500 Internal Server Error**: If an error occurred while updating the password.

- **Example Request:**

  ```json
  {
    "password": "newsecurepassword"
  }
  ```

- **Example Response:**

  ```json
  {
  "message": "Password updated successfully!"
  }
  ```

### Game Endpoints

#### 1. **POST** `game/create` - Create Game

- **Description:** Creates a new game based on the provided settings like game name, difficulty, round time, and total rounds.

- **Request Body:**
  - `gameName`: string (required) - The name of the game.
  - `difficulty`: string (required) - Difficulty level of the game. One of:
    - `easy`
    - `medium`
    - `hard`
  - `roundTime`: number (required) - Time in seconds for each round.
  - `totalRounds`: number (required) - Total number of rounds to play.

- **Response:**
  - **200 OK**: Redirects to the newly created game room with the shortened game ID.
  - **500 Internal Server Error**: If an error occurs during game creation.

- **Example Request Body:**

  ```json
  {
    "gameName": "Alias Challenge",
    "difficulty": "medium",
    "roundTime": 60,
    "totalRounds": 5
  }

#### 2. **GET** `game/join` - Render Join Game Page

- **Description:**
  Renders the page for users to join an existing game. This endpoint retrieves all the games that are not started yet and displays them to the user.

- **Response:**
  - **200 OK**: Renders the `join-game` view with the list of available games. If there are no games available, an empty list is provided.

#### 3. **GET** `game/create` - Render Create Game Form

- **Description:**
  Renders the form for creating a new game. This endpoint allows users to access the game creation interface where they can input details like the game name, difficulty, round time, and total rounds.

- **Request Body:**
  - No request body is needed for this endpoint.

- **Response Body:**
  - **200 OK**: Renders the `create-game` view, which contains the form for game creation.

#### 4. **POST** `game/join` - Join a Game

- **Description:**
  Allows a user to join an existing game by submitting the game code. The server checks if the game exists and redirects the user to the game room if successful.

- **Request Body:**
  - **Content-Type:** `application/json`
  - **Required Fields:**
    - `gameCode` (string): The unique code of the game that the user wants to join.
- **Response Body:**
  - **200 OK**: Redirects to the game room if the game exists.
  - **404 Not Found**: Returns an error message if the game with the specified game code does not exist.

- **Example Request:**

  ```json
  {
      "gameCode": "123456"
  }
  ```

#### 5. **GET** `game/:gameId/chat` - Get Chat History for a Game

- **Description:**
  Retrieves the chat history for a specific game identified by its `gameId`. This allows players to see the messages exchanged during the game.

- **Response Body:**
  - **200 OK**: Returns an array of chat messages for the specified game.
  - **500 Internal Server Error**: Returns an error message if there was an issue retrieving the chat history.

- **Example Response:**

  ```json
  {
    {
        "sender": "player1",
        "message": "Hello everyone!",
        "timestamp": "2024-10-10T10:00:00Z"
    },
    {
        "sender": "player2",
        "message": "Let's start the game!",
        "timestamp": "2024-10-10T10:01:00Z"
    }
  }
  ```

#### 6.**POST** `game/:gameId/chat/send` - Send a Message in the Game's Chat

- **Description:**
  Sends a chat message in the specified game's chat. This allows players to communicate with each other during the game.

- **Request Body:**
  - **Content-Type:** `application/json`
  - **Required Fields:**
    - `sender` (string): The username of the player sending the message.
    - `message` (string): The content of the message being sent.
    - `type` (string): The type of message being sent (e.g., "description", "message").

- **Response Body:**
  - **200 OK**: Returns a confirmation message indicating the message has been added to the chat.
  - **500 Internal Server Error**: Returns an error message if there was an issue adding the message to the chat.

- **Example Request:**

  ```http
  POST /123456/chat/send HTTP/1.1
  Host: yourdomain.com
  Authorization: Bearer <your_jwt_token>
  Content-Type: application/json

  {
      "sender": "player1",
      "message": "I am ready!",
      "type": "message"
  }
  ```

- **Example Response:**

  ```json
  {
    "message": "Message added to chat"
  }
  ```

#### 7. **GET** `game/:gameId/updateScore/:username/:points` - Update User's Score

- **Description:**
  Updates the score for a specific user in the game. This endpoint is typically used to modify the score based on game actions such as guessing a word correctly.

- **Request Parameters:**
  - `gameId` (string): The ID of the game in which the user's score is to be updated.
  - `username` (string): The username of the player whose score is to be updated.
  - `points` (number): The number of points to be added to the user's score.

- **Response Body:**
  - **200 OK**: Returns a confirmation message indicating that the user's score has been updated.
  - **500 Internal Server Error**: Returns an error message if there was an issue updating the score.

#### 8. **GET** `game/:gameId` - Render Room Page

- **Description:**
  Renders the room page for the specified game.

- **Request Parameters:**
  - `gameId` (string): The ID of the game whose room page should be rendered.

- **Response Body:**
  - **200 OK**: Renders the game room page.
  - **404 Not Found**: Returns an error message if the game is not found or the game ID is invalid.

- **Example Response:**

  ```md
  Room Page with all data for the game
  ```

#### 9. **GET** `game/:gameCode/generateWord` - Generate Word for the Game

- **Description:**
  This endpoint generates a new word for the specified game. The generated word will be used in the game for the current round or turn.

- **Request Parameters:**
  - `gameCode` (string): The unique code of the game for which the word should be generated.

- **Response Body:**
  - **200 OK**: Returns the generated word for the game.
    - `word` (string): The newly generated word.

  - **500 Internal Server Error**: Returns an error message if the word generation fails.

- **Example Response:**

  ```json
  {
    "word": "elephant"
  }
  ```

#### 10. **GET** `game/:gameCode/getTeams` - Get Teams for the Game

- **Description:**
  This endpoint retrieves the players in both teams for the specified game using its game code.

- **Request Parameters:**
  - `gameCode` (string): The unique code of the game for which the teams should be retrieved.

- **Response Body:**
  - **200 OK**: Returns the players in both teams for the game.
    - `team1` (array of strings): List of players in Team 1.
    - `team2` (array of strings): List of players in Team 2.

  - **500 Internal Server Error**: Returns an error message if there is an issue retrieving the teams.

- **Example Response:**

  ```json
  {
    "team1": ["Alice", "Bob"],
    "team2": ["Charlie", "Diana"]
  }
  ```

#### 11. **GET** `game/:gameCode/currentWord` - Get the Current Word for the Game

- **Description:**
  This endpoint retrieves the current word that is being used in the specified game identified by its game code.

- **Request Parameters:**
  - `gameCode` (string): The unique code of the game for which the current word should be retrieved.

- **Response Body:**
  - **200 OK**: Returns the current word for the game.
    - `word` (string): The current word being used in the game.

  - **404 Not Found**: Returns an error message if the current word could not be found for the specified game code.

- **Example Response:**

  ```json
  {
    "word": "elephant"
  }
  ```

  #### 12. **GET** `game/:gameCode/scores` - Get Current Scores for the Game

  - **Description:**
    This endpoint retrieves the current scores for the specified game identified by its game code.

  - **Request Parameters:**
    - `gameCode` (string): The unique code of the game for which the scores should be retrieved.

  - **Response Body:**
    - **200 OK**: Returns the current scores for the game.
      - `team1` (number): The score for Team 1.
      - `team2` (number): The score for Team 2.

    - **404 Not Found**: Returns an error message if the scores could not be found for the specified game code.

  - **Example Response:**

    ```json
    {
    "scores": {
        "team1": 0,
        "team2": 0
      }
    }
    ```

### 13. **GET** `game/:gameCode/switchTurn` - Switch Turn for the Game

- **Description:**
  This endpoint switches the turn for the specified game identified by its game code.

- **Request Parameters:**
  - `gameCode` (string): The unique code of the game for which the turn should be switched.

- **Response Body:**
  - **200 OK**: Returns the new turn data for the game.
    - `currentTeam` (string): The name of the current team.
    - `describer` (string): The name of the describer.
    - `guessers` (array of strings): The names of the guessers.
  - **500 Internal Server Error**: Returns an error message if there is an issue retrieving the data.

- **Example Response:**

  ```json
  {
    "currentTeam": "team2",
    "describer": "Mikita",
    "guessers": []
  }
  ```

  ### 14. **GET** `game/:gameCode/getTurn` - Get Turn for the Game

  - **Description:**
    This endpoint retrieves the turn data for the specified game identified by its game code.

  - **Request Parameters:**
    - `gameCode` (string): The unique code of the game for which the turn should be retrieved.

  - **Response Body:**
    - **200 OK**: Returns the turn data for the game.
      - `currentTeam` (string): The name of the current team.
      - `describer` (string): The name of the describer.
      - `guessers` (array of strings): The names of the guessers.

    - **500 Internal Server Error**: Returns an error message if there is an issue retrieving the data.

  - **Example Response:**

    ```json
    {
      "currentTeam": "team2",
      "describer": "Mikita",
      "guessers": []
    }
    ```

## Models

### Chat Model Documentation

| Field      | Type            | Description                                         |
|------------|-----------------|-----------------------------------------------------|
| `messages` | `IMessage[]`    | An array of messages in the chat.                  |

#### IMessage Interface

| Field       | Type             | Description                                         |
|-------------|------------------|-----------------------------------------------------|
| `timestamp` | `Date`           | The timestamp of when the message was sent (default: current date). |
| `sender`    | `String`         | The username or identifier of the message sender.  |
| `type`      | `String`         | The type of message, either "description" or "message". |
| `content`   | `String`         | The actual content of the message.                  |

#### ChatSchema

The `ChatSchema` consists of a single field:

- `messages`: An array containing `MessageSchema` objects.

#### MessageSchema

The `MessageSchema` consists of the following fields:

- `timestamp`: Automatically set to the current date and time when a message is created.
- `sender`: Required field representing the sender of the message.
- `type`: Required field that indicates the type of message, which can either be "description" or "message".
- `content`: Required field containing the actual text of the message.

### User Model Documentation

| Field       | Type             | Description                                         |
|-------------|------------------|-----------------------------------------------------|
| `username`  | `String`         | The username of the user (required).               |
| `password`  | `String`         | The user's password (required).                     |
| `stats`     | `Object`         | An object containing user statistics.               |
| `createdAt` | `Date`           | The date and time when the user was created (default: current date). |

#### User Statistics (`stats`)

| Field           | Type     | Description                                           |
|------------------|----------|-----------------------------------------------------|
| `gamesPlayed`    | `Number` | The total number of games played by the user (default: 0). |
| `gamesWon`       | `Number` | The total number of games won by the user (default: 0). |
| `wordsGuessed`   | `Number` | The total number of words guessed by the user (default: 0). |

#### UserSchema

The `UserSchema` consists of the following fields:

- `username`: Required field for the user's username.
- `password`: Required field for the user's password.
- `stats`: An object containing statistics about the user's game history.
- `createdAt`: Automatically set to the current date and time when a user is created.

### Game Model Documentation

#### Game Interface

| Field          | Type                | Description                                         |
|----------------|---------------------|-----------------------------------------------------|
| `gameName`     | `String`            | The name of the game (required).                   |
| `difficulty`   | `String`            | The difficulty level of the game (`easy`, `medium`, `hard`, required). |
| `status`       | `String`            | The current status of the game (`creating`, `playing`, `finished`). |
| `team1`        | `ITeam`             | The first team participating in the game.          |
| `team2`        | `ITeam`             | The second team participating in the game.         |
| `currentTurn`  | `Number`            | The index of the current turn (default: 0).        |
| `createdAt`    | `Date`              | The date and time when the game was created (default: current date). |
| `roundTime`    | `Number`            | The duration of each round in seconds (required).  |
| `totalRounds`  | `Number`            | The total number of rounds in the game (required). |

#### Team Interface

| Field       | Type          | Description                                         |
|-------------|---------------|-----------------------------------------------------|
| `players`   | `String[]`    | An array of player usernames in the team (default: empty array). |
| `chatID`    | `String`      | The chat ID associated with the team.              |
| `score`     | `IScore[]`    | An array of scores for the team (default: empty array). |

#### Score Interface

| Field      | Type       | Description                                         |
|------------|------------|-----------------------------------------------------|
| `word`     | `String`   | The word associated with the score.                |
| `status`   | `String`   | The status of the word (`guessed`, `not guessed`). |
| `guessed`  | `String`   | The username of the player who guessed the word (default: "nobody"). |

#### GameSchema

The `GameSchema` consists of the following fields:

- `gameName`: Required field for the game's name.
- `difficulty`: Required field for the game's difficulty level.
- `roundTime`: Required field for the duration of each round.
- `totalRounds`: Required field for the total number of rounds.
- `status`: Indicates the current status of the game.
- `team1`: The first team participating in the game.
- `team2`: The second team participating in the game.
- `currentTurn`: Automatically set to 0 when the game is created.
- `createdAt`: Automatically set to the current date and time when a game is created.

## Authentication and Authorization (JWT)

To secure the endpoints, such as creating a game room, making guesses, or sending chat messages, JWT authentication is implemented. Users need to log in to obtain a JWT token, which must be passed in the headers for accessing protected endpoints.

```http
Authorization: Bearer <token>
```

## Environment Variables (`.env`)

Make sure to configure the following environment variables in your `.env` file:

```md
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
