const express = require("express");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// API Data Storage
let trafficData = [];

// Load sample data if available
try {
  const sampleData = fs.readFileSync(
    path.join(__dirname, "data", "trafficData.json"),
    "utf8"
  );
  trafficData = JSON.parse(sampleData);
  console.log("Loaded sample data");
} catch (err) {
  console.log("Starting with empty dataset");
}

// API Endpoints
app.post("/api/traffic", (req, res) => {
  const newData = req.body;

  // Validation
  if (!newData.latitude || !newData.longitude) {
    return res.status(400).send("Missing coordinates");
  }

  // Add metadata
  newData.timestamp = new Date().toISOString();
  newData.deviceId =
    newData.deviceId || `user-${Math.random().toString(36).substr(2, 9)}`;

  // Add to dataset
  trafficData.push(newData);

  // Broadcast to WebSocket clients
  broadcastData(newData);

  // Save to file (for persistence)
  fs.writeFileSync(
    path.join(__dirname, "data", "trafficData.json"),
    JSON.stringify(trafficData, null, 2)
  );

  res.status(201).json({ message: "Data received", id: newData.deviceId });
});

app.get("/api/traffic", (req, res) => {
  res.json(trafficData);
});

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// Handle 404
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// WebSocket Server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

function broadcastData(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "NEW_DATA",
          data: data,
        })
      );
    }
  });
}

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  // Send current dataset
  ws.send(
    JSON.stringify({
      type: "INITIAL_DATA",
      data: trafficData,
    })
  );

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Cleanup on exit
process.on("SIGINT", () => {
  console.log("\nSaving data before shutdown...");
  fs.writeFileSync(
    path.join(__dirname, "data", "trafficData.json"),
    JSON.stringify(trafficData, null, 2)
  );
  process.exit();
});
