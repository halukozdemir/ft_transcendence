const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const GameRoom = require("./game/GameRoom");

const app = express();
app.use(cors());
app.use(express.json());

const scoreLimit = Number(process.env.GAME_SCORE_LIMIT) || 5;
const timeLimitSeconds = Number(process.env.GAME_TIME_LIMIT_SECONDS) || 180;
const simulationFps = Number(process.env.GAME_SIMULATION_FPS) || 60;
const broadcastFps = Number(process.env.GAME_BROADCAST_FPS) || 30;

// Health check
app.get("/api/game/health/", (req, res) => {
  res.json({ status: "ok", service: "game" });
});

app.get("/api/game/render-config/", (req, res) => {
  const state = room.getState();
  res.json({
    simulationFps,
    broadcastFps,
    viewport: state.viewport,
    render: {
      court: state.render.court,
    },
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  path: "/ws/game/",
  transports: ["websocket"],
  allowUpgrades: false,
  pingInterval: 10000,
  pingTimeout: 5000,
});

const room = new GameRoom({ scoreLimit, timeLimitSeconds });

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  const handshakeClientId =
    socket.handshake.auth?.clientId || socket.handshake.query?.clientId;
  const clientId = room.normalizeClientId(handshakeClientId);

  if (!clientId) {
    socket.emit("invalid_client");
    socket.disconnect();
    return;
  }

  const existingSocketId = room.getSocketIdByClientId(clientId);
  if (existingSocketId && existingSocketId !== socket.id) {
    room.removePlayer(existingSocketId, { suppressMatchEnd: true });
    const existingSocket = io.sockets.sockets.get(existingSocketId);
    if (existingSocket) {
      existingSocket.disconnect(true);
    }
  }

  const added = room.addPlayer(socket.id, clientId);
  if (!added) {
    console.log("Room full, rejecting:", socket.id);
    socket.emit("room_full");
    socket.disconnect();
    return;
  }

  socket.emit("joined", {
    team: room.players[socket.id].team,
  });

  console.log("Player joined", {
    socketId: socket.id,
    team: room.players[socket.id].team,
    playerCount: room.playerCount,
    matchStatus: room.match.status,
  });

  socket.emit("state", room.getState());

  socket.on("input", (input) => {
    room.handleInput(socket.id, input);
  });

  socket.on("kick", () => {
    room.requestKick(socket.id);
  });

  socket.on("forfeit", () => {
    room.forfeit(socket.id);
  });

  socket.on("debug:config", (config) => {
    if (config.playerSpeed !== undefined) {
      Object.values(room.players).forEach((p) => (p.speed = config.playerSpeed));
      room._dbgPlayerSpeed = config.playerSpeed;
    }
    if (config.kickPower !== undefined) {
      Object.values(room.players).forEach((p) => (p.kickPower = config.kickPower));
      room._dbgKickPower = config.kickPower;
    }
    if (config.kickRadius !== undefined) {
      Object.values(room.players).forEach((p) => (p.kickRadius = config.kickRadius));
      room._dbgKickRadius = config.kickRadius;
    }
    if (config.playerFriction !== undefined) {
      Object.values(room.players).forEach((p) => (p.friction = config.playerFriction));
      room._dbgPlayerFriction = config.playerFriction;
    }
    if (config.ballFriction !== undefined) {
      room.ball.friction = config.ballFriction;
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    room.removePlayer(socket.id);
    console.log("Player removed", {
      socketId: socket.id,
      playerCount: room.playerCount,
      matchStatus: room.match.status,
    });
  });
});

// Keep simulation and publish loops independent.
const simulationTickMs = 1000 / simulationFps;
const broadcastTickMs = 1000 / broadcastFps;

setInterval(() => {
  room.update();
}, simulationTickMs);

setInterval(() => {
  io.emit("state", room.getBroadcastState());
}, broadcastTickMs);

const PORT = process.env.GAME_SERVICE_PORT || 8001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Game Service running on port ${PORT}`);
});
