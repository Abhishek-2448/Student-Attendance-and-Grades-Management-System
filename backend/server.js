import "./config/env.js";
import appObj from "./app.js";
import { testConnection } from "./config/db.js";

const PORT = process.env.PORT || 3000;

try {
  await testConnection();
} catch (error) {
  console.error("MySQL connection failed:", error.message);
  process.exit(1);
}

appObj.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
