const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const GameRoom = require("./game/GameRoom");

const app = express();
app.use(cors());
app.use(express.json());

const scoreLimit = Number(process.env.GAME_SCORE_LIMIT) || 5;
const timeLimitSeconds = Number(process.env.GAME_TIME_LIMIT_SECONDS) || 180;
const simulationFps = Number(process.env.GAME_SIMULATION_FPS) || 60;
const broadcastFps = Number(process.env.GAME_BROADCAST_FPS) || 30;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

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

// Get leaderboard from game stats
app.get("/api/game/leaderboard/", (req, res) => {
  // TODO: Implement leaderboard from game stats DB
  // This should pull data from auth_service stats
  res.json([]);
});

// Get player stats
app.get("/api/game/stats/:userId/", (req, res) => {
  // TODO: Implement player stats endpoint
  // Should fetch from auth_service PlayerStats model
  res.json({
    user_id: req.params.userId,
    total_matches: 0,
    wins: 0,
    win_rate: 0,
    elo_rating: 1200,
  });
});

// Get match history
app.get("/api/game/matches/", (req, res) => {
  // TODO: Implement match history
  // Should fetch from auth_service MatchRecord model
  res.json([]);
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

// JWT Middleware - verify token from auth header or query
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  
  if (!token) {
    return next(new Error("No authentication token provided"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.sub || decoded.user_id;
    socket.userEmail = decoded.email;
    next();
  } catch (err) {
    next(new Error(`Authentication failed: ${err.message}`));
  }
});

const room = new GameRoom({ scoreLimit, timeLimitSeconds });

io.on("connection", (socket) => {
  console.log("Connected:", socket.id, "User:", socket.userId);

  const clientId = socket.userId || socket.id;

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
    userId: socket.userId,
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
