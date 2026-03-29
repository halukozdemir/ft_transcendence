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
const teamSize = Math.max(1, Number(process.env.GAME_TEAM_SIZE) || 2);
const minPlayersPerTeam = Math.max(1, Number(process.env.GAME_MIN_PLAYERS_PER_TEAM) || 1);
const maxPlayersPerTeam = Math.max(minPlayersPerTeam, Number(process.env.GAME_MAX_PLAYERS_PER_TEAM) || teamSize);
const simulationFps = Number(process.env.GAME_SIMULATION_FPS) || 60;
const broadcastFps = Number(process.env.GAME_BROADCAST_FPS) || 30;
const emptyRoomGraceRaw = Number(process.env.GAME_EMPTY_ROOM_GRACE_MS);
const usedEmptyRoomGraceRaw = Number(process.env.GAME_EMPTY_USED_ROOM_GRACE_MS);
const DEFAULT_EMPTY_ROOM_GRACE_MS = 10_000;
const DEFAULT_USED_EMPTY_ROOM_GRACE_MS = 3_000;
const emptyRoomGraceMs = Number.isFinite(emptyRoomGraceRaw) && emptyRoomGraceRaw > 0
  ? emptyRoomGraceRaw
  : DEFAULT_EMPTY_ROOM_GRACE_MS;
const usedEmptyRoomGraceMs = Number.isFinite(usedEmptyRoomGraceRaw) && usedEmptyRoomGraceRaw >= 0
  ? usedEmptyRoomGraceRaw
  : DEFAULT_USED_EMPTY_ROOM_GRACE_MS;
const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "dev-secret-key";
const SERVICE_SECRET = process.env.SERVICE_SECRET || "dev-service-secret";
const AUTH_SERVICE_URL = "http://auth_service:8000";

async function reportMatchResult(data) {
  const body = JSON.stringify({
    winner_team: data.winnerTeam,
    score_red: data.scoreRed,
    score_blue: data.scoreBlue,
    duration_seconds: data.durationSeconds,
    red_player_ids: data.redPlayerIds,
    blue_player_ids: data.bluePlayerIds,
    end_reason: data.endReason,
  });

  try {
    const res = await fetch(`${AUTH_SERVICE_URL}/api/auth/match-result/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Secret": SERVICE_SECRET,
        "X-Forwarded-Host": "auth-service",
      },
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Match result report failed: ${res.status} ${text}`);
    } else {
      console.log("Match result reported successfully");
    }
  } catch (err) {
    console.error("Match result report error:", err.message);
  }
}

// Health check
app.get("/api/game/health/", (req, res) => {
  res.json({ status: "ok", service: "game" });
});

app.get("/api/game/render-config/", (req, res) => {
  const tempRoom = new GameRoom({
    scoreLimit,
    timeLimitSeconds,
    teamSize,
    minPlayersPerTeam,
    maxPlayersPerTeam,
  });
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
const clientDisplayNames = new Map(); // clientId -> username
let roomCounter = 0;

function normalizeDisplayName(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, 40);
}

function isClientInAnyRoom(clientId) {
  for (const [, room] of rooms) {
    if (room.getSocketIdByClientId(clientId)) return true;
  }
  return false;
}

function getRoomHealth(room, lagMs) {
  if (room.playerCount === 0) return "offline";
  if (lagMs > 80) return "warning";
  return "healthy";
}

function mapRoomForLobby(room) {
  const roomInfo = room.getRoomInfo();
  const lagMs = Math.max(0, Date.now() - (room.lastSimulationAt || Date.now()));
  const hostRaw = roomInfo.host;
  const host = hostRaw ? (clientDisplayNames.get(String(hostRaw)) || `User#${hostRaw}`) : "-";
  const fallbackTitle = `Room ${String(roomInfo.id || "").replace("room_", "#")}`;

  return {
    id: roomInfo.id,
    title: roomInfo.title || fallbackTitle,
    host,
    currentPlayers: roomInfo.playerCount,
    maxPlayers: roomInfo.maxPlayers,
    isLocked: roomInfo.isLocked,
    isFull: roomInfo.isFull,
    availableSlots: roomInfo.availableSlots,
    pingMs: lagMs,
    health: getRoomHealth(room, lagMs),
    matchStatus: room.match.status,
    teams: roomInfo.teams,
    minPlayersPerTeam: roomInfo.minPlayersPerTeam,
    maxPlayersPerTeam: roomInfo.maxPlayersPerTeam,
    createdAt: roomInfo.createdAt,
  };
}

app.get("/api/game/rooms/", (req, res) => {
  const roomList = Array.from(rooms.values())
    .map((room) => mapRoomForLobby(room))
    .sort((a, b) => {
      if (b.currentPlayers !== a.currentPlayers) return b.currentPlayers - a.currentPlayers;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });

  res.json({
    rooms: roomList,
    totalRooms: roomList.length,
    totalPlayers: roomList.reduce((sum, room) => sum + room.currentPlayers, 0),
    serverTimeMs: Date.now(),
  });
});

app.post("/api/game/rooms/", (req, res) => {
  const body = req.body || {};
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const isLocked = Boolean(body.isLocked);
  const password = typeof body.password === "string" ? body.password : "";
  const requestedMaxPlayers = Number(body.maxPlayers);
  const safeMaxPlayers = Number.isFinite(requestedMaxPlayers) ? Math.max(2, Math.min(12, requestedMaxPlayers)) : null;
  const requestedPerTeam = safeMaxPlayers ? Math.max(1, Math.floor(safeMaxPlayers / 2)) : maxPlayersPerTeam;

  if (isLocked && password.trim().length === 0) {
    return res.status(400).json({ error: "Password is required for locked rooms." });
  }

  const room = createRoom({
    title: title || "Custom Room",
    isLocked,
    password,
    maxPlayersPerTeam: requestedPerTeam,
    minPlayersPerTeam: Math.min(minPlayersPerTeam, requestedPerTeam),
  });

  res.status(201).json({
    room: mapRoomForLobby(room),
  });
});

app.post("/api/game/rooms/:roomId/validate-password/", (req, res) => {
  const roomId = String(req.params.roomId || "").trim();
  const room = rooms.get(roomId);

  if (!room) {
    return res.status(404).json({ valid: false, error: "Room not found" });
  }

  if (!room.requiresPassword()) {
    return res.json({ valid: true, requiresPassword: false });
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const valid = room.validatePassword(password);
  return res.json({ valid, requiresPassword: true });
});

function createRoom(options = {}) {
  const roomId = `room_${++roomCounter}`;
  const room = new GameRoom({
    scoreLimit,
    timeLimitSeconds,
    teamSize: options.teamSize || teamSize,
    minPlayersPerTeam: options.minPlayersPerTeam || minPlayersPerTeam,
    maxPlayersPerTeam: options.maxPlayersPerTeam || maxPlayersPerTeam,
    title: options.title,
    isLocked: Boolean(options.isLocked),
    password: typeof options.password === "string" ? options.password : "",
    onMatchFinished: (data) => reportMatchResult(data),
  });
  room.id = roomId;
  room.emptySince = Date.now();
  room.hasSeenPlayers = false;
  rooms.set(roomId, room);
  console.log(`Oda olusturuldu: ${roomId}`);
  return room;
}

function findJoinableRoom() {
  for (const [, room] of rooms) {
    if (
      room.match.status === "lobby" &&
      !room.requiresPassword() &&
      room.playerCount < room.getMatchCapacity()
    ) {
      return room;
    }
  }
  return null;
}

function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.playerCount > 0) {
    if (room) {
      room.emptySince = null;
    }
    return;
  }

  const now = Date.now();
  room.emptySince = room.emptySince || now;
  const graceMs = room.hasSeenPlayers ? usedEmptyRoomGraceMs : emptyRoomGraceMs;

  if (now - room.emptySince >= graceMs) {
    rooms.delete(roomId);
    console.log(`Oda silindi: ${roomId}`);
  }
}

function emitJoinErrorAndDisconnect(socket, eventName, payload = {}) {
  socket.emit(eventName, payload);
  setTimeout(() => {
    socket.disconnect(true);
  }, 75);
}

io.on("connection", (socket) => {
  console.log("Baglandi:", socket.id, "User:", socket.userId);

  const clientId = socket.userId || socket.id;
  const requestedDisplayName = normalizeDisplayName(socket.handshake.auth?.username || socket.handshake.query?.username);
  if (requestedDisplayName) {
    clientDisplayNames.set(clientId, requestedDisplayName);
  }
  const requestedRoomIdRaw = socket.handshake.auth?.roomId || socket.handshake.query?.roomId;
  const requestedRoomId = typeof requestedRoomIdRaw === "string" ? requestedRoomIdRaw.trim() : "";
  const roomPasswordRaw = socket.handshake.auth?.roomPassword || socket.handshake.query?.roomPassword;
  const roomPassword = typeof roomPasswordRaw === "string" ? roomPasswordRaw : "";

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

  let room;
  if (requestedRoomId) {
    room = rooms.get(requestedRoomId);
    if (!room) {
      emitJoinErrorAndDisconnect(socket, "room_not_found", { roomId: requestedRoomId });
      return;
    }

    if (room.requiresPassword() && !room.validatePassword(roomPassword)) {
      emitJoinErrorAndDisconnect(socket, "room_invalid_password", { roomId: requestedRoomId });
      return;
    }
  } else {
    // Quick match: bos oda bul veya yeni olustur
    room = findJoinableRoom();
    if (!room) {
      room = createRoom();
    }
  }

  const added = room.addPlayer(socket.id, clientId);
  if (!added) {
    console.log("Oda dolu, reddedildi:", socket.id);
    emitJoinErrorAndDisconnect(socket, "room_full");
    return;
  }

  const roomId = room.id;
  room.hasSeenPlayers = true;
  room.emptySince = null;
  socketRoom.set(socket.id, roomId);
  socket.join(roomId);

  socket.emit("joined", {
    team: room.players[socket.id].team,
    roomId,
    room: room.getRoomInfo(),
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

  socket.on("switch_team", () => {
    const roomIdForSocket = socketRoom.get(socket.id);
    const r = rooms.get(roomIdForSocket);
    if (!r) return;

    const result = r.switchTeam(socket.id);
    if (result.ok) {
      io.to(roomIdForSocket).emit("state", r.getState());
    } else {
      socket.emit("action_error", { action: "switch_team", reason: result.reason });
    }
  });

  socket.on("toggle_ready", () => {
    const roomIdForSocket = socketRoom.get(socket.id);
    const r = rooms.get(roomIdForSocket);
    if (!r) return;

    const result = r.toggleReady(socket.id);
    if (result.ok) {
      io.to(roomIdForSocket).emit("state", r.getState());
    } else {
      socket.emit("action_error", { action: "toggle_ready", reason: result.reason });
    }
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

      // Push immediate state after a leave event so clients can show waiting UI instantly.
      if (r.playerCount > 0) {
        io.to(rId).emit("state", r.getState());
      }

      cleanupRoom(rId);
    }
    if (!isClientInAnyRoom(clientId)) {
      clientDisplayNames.delete(clientId);
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
  // Cleanup empty rooms
  for (const roomId of rooms.keys()) {
    cleanupRoom(roomId);
  }
}, broadcastTickMs);

const PORT = process.env.GAME_SERVICE_PORT || 8001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Game Service running on port ${PORT}`);
});
