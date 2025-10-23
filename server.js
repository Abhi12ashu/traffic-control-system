const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, "frontend")));

// Serve styles from the styles subdirectory
app.use("/styles", express.static(path.join(__dirname, "frontend", "styles")));

// Handle all routes by serving index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Start server on your local IP (use the IP from ipconfig)
app.listen(PORT, "192.168.1.10", () => {
  console.log(`Server running at:
  - Local: http://localhost:${PORT}
  - Network: http://192.168.1.10:${PORT}`);
});
