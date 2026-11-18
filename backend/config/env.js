import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Resolve relative to the project, not the folder `node` was started from.
dotenv.config({
  path: fileURLToPath(new URL("../application.env", import.meta.url)),
});
