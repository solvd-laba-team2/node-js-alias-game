import "dotenv/config";
import express, { Application } from "express";

// Import your configuration files
import configureHandlebars from "./config/handlebars";
import configureMiddleware from "./config/middleware";
import configureRoutes from "./config/routes";

// Initialize express app
const app: Application = express();

// Apply configurations to the app
configureHandlebars(app);
configureMiddleware(app);
configureRoutes(app);

// Export the app for use in other modules
export default app;
