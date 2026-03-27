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
const defaultMaxPlayersPerTeam = Number(process.env.GAME_MAX_PLAYERS_PER_TEAM) || 1;
const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "dev-secret-key";

// Health check
app.get("/api/game/health/", (req, res) => {
  res.json({ status: "ok", service: "game" });
});

app.get("/api/game/render-config/", (req, res) => {
  const tempRoom = new GameRoom({ scoreLimit, timeLimitSeconds });
  const state = tempRoom.getState();
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

// ── Multi-room matchmaking ──────────────────────────────────────────────────

const rooms = new Map();        // roomId -> GameRoom
const socketRoom = new Map();   // socket.id -> roomId
let roomCounter = 0;

function createRoom(maxPlayersPerTeam) {
  const roomId = `room_${++roomCounter}`;
  const mpt = maxPlayersPerTeam || defaultMaxPlayersPerTeam;
  const room = new GameRoom({ scoreLimit, timeLimitSeconds, maxPlayersPerTeam: mpt });
  room.id = roomId;
  rooms.set(roomId, room);
  console.log(`Oda olusturuldu: ${roomId} (${mpt}v${mpt})`);
  return room;
}

function findWaitingRoom(maxPlayersPerTeam) {
  const mpt = maxPlayersPerTeam || defaultMaxPlayersPerTeam;
  for (const [, room] of rooms) {
    if (
      room.match.status === "waiting" &&
      room.playerCount < room.maxPlayersPerTeam * 2 &&
      room.maxPlayersPerTeam === mpt
    ) {
      return room;
    }
  }
  return null;
}

function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (room && room.playerCount === 0) {
    rooms.delete(roomId);
    console.log(`Oda silindi: ${roomId}`);
  }
}

io.on("connection", (socket) => {
  console.log("Baglandi:", socket.id, "User:", socket.userId);

  const clientId = socket.userId || socket.id;

  // Parse requested maxPlayersPerTeam from socket query (defaults to server default)
  const requestedMpt = Math.max(1, Math.min(
    Number(socket.handshake.query?.maxPlayersPerTeam) || defaultMaxPlayersPerTeam,
    6 // cap at 6 per team
  ));

  // Onceki baglantisi varsa temizle
  for (const [existingRoomId, room] of rooms) {
    const existingSocketId = room.getSocketIdByClientId(clientId);
    if (existingSocketId && existingSocketId !== socket.id) {
      room.removePlayer(existingSocketId, { suppressMatchEnd: true });
      socketRoom.delete(existingSocketId);
      const existingSocket = io.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        existingSocket.leave(existingRoomId);
        existingSocket.disconnect(true);
      }
      cleanupRoom(existingRoomId);
    }
  }

  // Quick match: bos oda bul veya yeni olustur
  let room = findWaitingRoom(requestedMpt);
  if (!room) {
    room = createRoom(requestedMpt);
  }

  const added = room.addPlayer(socket.id, clientId);
  if (!added) {
    console.log("Oda dolu, reddedildi:", socket.id);
    socket.emit("room_full");
    socket.disconnect();
    return;
  }

  const roomId = room.id;
  socketRoom.set(socket.id, roomId);
  socket.join(roomId);

  socket.emit("joined", {
    team: room.players[socket.id].team,
    roomId,
    maxPlayersPerTeam: room.maxPlayersPerTeam,
  });

  console.log("Oyuncu katildi", {
    socketId: socket.id,
    userId: socket.userId,
    roomId,
    team: room.players[socket.id].team,
    playerCount: room.playerCount,
    matchStatus: room.match.status,
  });

  socket.emit("state", room.getState());

  socket.on("input", (input) => {
    const r = rooms.get(socketRoom.get(socket.id));
    if (r) r.handleInput(socket.id, input);
  });

  socket.on("kick", () => {
    const r = rooms.get(socketRoom.get(socket.id));
    if (r) r.requestKick(socket.id);
  });

  socket.on("forfeit", () => {
    const r = rooms.get(socketRoom.get(socket.id));
    if (r) r.forfeit(socket.id);
  });

  socket.on("debug:config", (config) => {
    const r = rooms.get(socketRoom.get(socket.id));
    if (!r) return;
    if (config.playerSpeed !== undefined) {
      Object.values(r.players).forEach((p) => (p.speed = config.playerSpeed));
      r._dbgPlayerSpeed = config.playerSpeed;
    }
    if (config.kickPower !== undefined) {
      Object.values(r.players).forEach((p) => (p.kickPower = config.kickPower));
      r._dbgKickPower = config.kickPower;
    }
    if (config.kickRadius !== undefined) {
      Object.values(r.players).forEach((p) => (p.kickRadius = config.kickRadius));
      r._dbgKickRadius = config.kickRadius;
    }
    if (config.playerFriction !== undefined) {
      Object.values(r.players).forEach((p) => (p.friction = config.playerFriction));
      r._dbgPlayerFriction = config.playerFriction;
    }
    if (config.ballFriction !== undefined) {
      r.ball.friction = config.ballFriction;
    }
  });

  socket.on("disconnect", () => {
    const rId = socketRoom.get(socket.id);
    const r = rooms.get(rId);
    if (r) {
      r.removePlayer(socket.id);
      console.log("Oyuncu ayrildi", {
        socketId: socket.id,
        roomId: rId,
        playerCount: r.playerCount,
      });
      cleanupRoom(rId);
    }
    socketRoom.delete(socket.id);
  });
});

// ── Simulation & broadcast ──────────────────────────────────────────────────

const simulationTickMs = 1000 / simulationFps;
const broadcastTickMs = 1000 / broadcastFps;

setInterval(() => {
  for (const [, room] of rooms) {
    room.update();
  }
}, simulationTickMs);

setInterval(() => {
  for (const [roomId, room] of rooms) {
    io.to(roomId).emit("state", room.getBroadcastState());
  }
}, broadcastTickMs);

const PORT = process.env.GAME_SERVICE_PORT || 8001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Game Service running on port ${PORT}`);
});
