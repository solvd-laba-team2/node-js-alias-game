import { Application } from "express";
import { engine } from "express-handlebars";
import path from "path";

export default (app: Application): void => {
  app.engine(
    "hbs",
    engine({
      extname: ".hbs",
      defaultLayout: "main",
      helpers: {
        eq: (a, b): boolean => a === b,
        or: (v1, v2) => v1 || v2,
      },
    }),
  );
  app.set("view engine", "hbs");
  app.set("views", path.join(__dirname, "../views"));
};
