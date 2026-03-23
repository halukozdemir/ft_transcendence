const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const GameRoom = require("./game/GameRoom");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/game/health/", (req, res) => {
  res.json({ status: "ok", service: "game" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  path: "/ws/game/",
});

const room = new GameRoom();

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  const added = room.addPlayer(socket.id);
  if (!added) {
    console.log("Room full, rejecting:", socket.id);
    socket.emit("room_full");
    socket.disconnect();
    return;
  }

  socket.emit("joined", {
    team: room.players[socket.id].team,
  });

  socket.on("input", (input) => {
    room.handleInput(socket.id, input);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    room.removePlayer(socket.id);
  });
});

// Physics at 60 FPS, network broadcast at 30 FPS
const PHYSICS_RATE = 1000 / 60;
let tick = 0;
setInterval(() => {
  room.update();
  tick++;
  if (tick % 2 === 0) {
    io.emit("state", room.getState());
  }
}, PHYSICS_RATE);

const PORT = process.env.GAME_SERVICE_PORT || 8001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Game Service running on port ${PORT}`);
});
