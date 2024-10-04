import express, { Application } from "express";
// Import your configuration files
import socketConnection from "./config/socket";
import configureHandlebars from "./config/handlebars";
import configureMiddleware from "./config/middleware";
import configureRoutes from "./config/routes";

// Initialize express app
const app: Application = express();

// Apply configurations to the app
configureHandlebars(app);
configureMiddleware(app);
configureRoutes(app);
const server = socketConnection(app);

// Export the app for use in other modules
export default server;
