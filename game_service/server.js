const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/game/health/", (req, res) => {
  res.json({ status: "ok", service: "game" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  path: "/ws/game/",
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.GAME_SERVICE_PORT || 8001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Game Service running on port ${PORT}`);
});
