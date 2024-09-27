
# Alias Game - Node.js-based Multiplayer Chat and Word Checking Game

This project is a multiplayer word-guessing game called "Alias," built with **Node.js**. It includes a chat functionality for each game and allows for word validation. The project follows an MVC structure and uses **Handlebars** for templating.

## Project Structure

```
/game-room
├── /config                    # Configuration files (middleware, routing, Handlebars setup)
├── /controllers               # Controllers handling logic for routes
├── /routes                    # Route definitions for chat and game
├── /services                  # Game logic and chat service
├── /views                     # Handlebars templates
├── /public                    # Static files (CSS, JS)
├── chatHistory.json           # JSON file storing chat history
├── app.js                     # Main application file (minimal)
├── server.js                  # Server startup file
└── package.json               # Project dependencies and scripts
```

## Features

- **Chat functionality**: Users can communicate in real-time during the game.
- **Word guessing**: Each game has a mechanism for word generation and word validation.
- **Separate games**: Each game has its own chat history, stored in a JSON file.
- **Modular structure**: The project follows the MVC architecture to keep logic, views, and routing organized.

## Setup Instructions

### Prerequisites

- **Node.js**: Ensure that you have Node.js installed.
- **npm**: Package manager to install dependencies.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo-url/alias-game.git
   ```
   
2. Navigate into the project directory:
   ```bash
   cd game-room
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Project

1. Start the server:
   ```bash
   node server.js
   ```

2. Open the browser and navigate to:
   ```bash
   http://localhost:3000/game/123
   ```

   This will load a game room for game ID `123`.

### Project Structure

- **Controllers**: Handle the core business logic for games and chat.
- **Routes**: Define routes for the chat and game logic.
- **Services**: Store and retrieve data (game logic, chat history).
- **Views**: Handlebars templates to render dynamic content on the client-side.
- **Public**: Static assets like CSS and client-side JavaScript.

### Example Usage

1. Open a game room:
   ```
   http://localhost:3000/game/123
   ```
2. Type a message in the chatbox and click "Send" to add a message to the chat.
3. View chat history and see real-time messages as they are added.

## Future Enhancements

- **Database Integration**: Migrate chat history and game data to a MongoDB database.
- **WebSockets**: Enable real-time chat using WebSockets for a better user experience.
- **Authentication**: Implement user authentication for better game session management.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
