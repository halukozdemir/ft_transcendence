const express = require("express")
const http = require("http")
const path = require("path")
const { Server } = require("socket.io")
const GameRoom = require("./game/GameRoom")

const app = express()
app.use(express.static(path.join(__dirname, "public")))
const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: "*" },
})

const room = new GameRoom()

io.on("connection", (socket) => {
    console.log("Connected:", socket.id)

    const added = room.addPlayer(socket.id)
    if (!added) {
        console.log("Room full, rejecting:", socket.id)
        socket.emit("room_full")
        socket.disconnect()
        return
    }

    // Tell this player which team they are on
    socket.emit("joined", {
        team: room.players[socket.id].team,
    })

    socket.on("input", (input) => {
        room.handleInput(socket.id, input)
    })

    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id)
        room.removePlayer(socket.id)
    })
})

// 60 FPS game loop
const TICK_RATE = 1000 / 60
setInterval(() => {
    room.update()
    io.emit("state", room.getState())
}, TICK_RATE)

const PORT = 3000
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
