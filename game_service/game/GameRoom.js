const Player = require("./Player")
const Ball = require("./Ball")
const { checkCollision, handleKick, checkPlayerCollision } = require("./physics")

class GameRoom {
    constructor(options = {}) {
        this.width = 800
        this.height = 500
        this.goalHeight = 150
        this.teamSize = Math.max(1, Number(options.teamSize) || 2)
        this.minPlayersPerTeam = Math.max(1, Number(options.minPlayersPerTeam) || 1)
        this.maxPlayersPerTeam = Math.max(this.minPlayersPerTeam, Number(options.maxPlayersPerTeam) || this.teamSize)
        this.lastAutoAssignedTeam = "blue"
        this.players = {}
        this.socketToClient = {}
        this.clientToSocket = {}
        this.clientTeam = {}
        this.pendingKicks = new Map()
        this.ball = new Ball(this.width, this.height)
        this.score = { red: 0, blue: 0 }
        this.playerCount = 0

        this.rules = {
            scoreLimit: options.scoreLimit || 5,
            timeLimitSeconds: options.timeLimitSeconds || 180,
        }

        this.match = {
            status: "waiting", // waiting | in_progress | finished
            startedAt: null,
            endedAt: null,
            endReason: null,
            winnerTeam: null,
            loserTeam: null,
            forfeitTeam: null,
            disconnectedTeam: null,
        }

        const requestedTitle = typeof options.title === "string" ? options.title.trim() : ""
        this.title = requestedTitle.length > 0 ? requestedTitle : "Quick Match"
        this.isLocked = Boolean(options.isLocked)
        this.password = this.isLocked && typeof options.password === "string" ? options.password : ""
        this.createdAt = Date.now()
        this.hostClientId = null
        this.simulationTick = 0
        this.lastSimulationAt = Date.now()
    }

    normalizeClientId(clientId) {
        if (typeof clientId !== "string") return null
        const normalized = clientId.trim()
        return normalized.length > 0 ? normalized : null
    }

    getSocketIdByClientId(clientId) {
        const normalized = this.normalizeClientId(clientId)
        if (!normalized) return null
        return this.clientToSocket[normalized] || null
    }

    isTeamOccupied(team) {
        return Object.values(this.players).some((player) => player.team === team)
    }

    getTeamPlayers(team) {
        return Object.values(this.players)
            .filter((player) => player.team === team)
            .sort((a, b) => a.id.localeCompare(b.id))
    }

    getTeamPlayerCount(team) {
        return this.getTeamPlayers(team).length
    }

    hasTeamCapacity(team) {
        return this.getTeamPlayerCount(team) < this.maxPlayersPerTeam
    }

    getSpawnPosition(team) {
        const teamPlayerCount = this.getTeamPlayerCount(team)
        const slot = teamPlayerCount + 1
        const totalSlots = this.maxPlayersPerTeam + 1
        const x = team === "red" ? 200 : this.width - 200
        const y = (this.height / totalSlots) * slot
        return {
            x,
            y: Math.max(40, Math.min(this.height - 40, y)),
        }
    }

    getMatchCapacity() {
        return this.maxPlayersPerTeam * 2
    }

    getReadyPlayerCount() {
        return 2
    }

    getHostClientId() {
        return this.hostClientId
    }

    getTitle() {
        return this.title
    }

    setTitle(rawTitle) {
        if (typeof rawTitle !== "string") return
        const normalized = rawTitle.trim()
        if (normalized.length === 0) return
        this.title = normalized.slice(0, 80)
    }

    requiresPassword() {
        return this.isLocked && this.password.length > 0
    }

    validatePassword(rawPassword) {
        if (!this.requiresPassword()) return true
        if (typeof rawPassword !== "string") return false
        return rawPassword === this.password
    }

    refreshHostClientId() {
        const firstSocketId = Object.keys(this.players).sort()[0]
        if (!firstSocketId) {
            this.hostClientId = null
            return
        }
        this.hostClientId = this.socketToClient[firstSocketId] || null
    }

    addPlayer(id, rawClientId) {
        if (this.playerCount >= this.getMatchCapacity()) return false

        const clientId = this.normalizeClientId(rawClientId)
        if (!clientId) return false

        if (this.match.status === "finished") {
            this.match.status = "waiting"
            this.match.startedAt = null
            this.match.endedAt = null
            this.match.endReason = null
            this.match.winnerTeam = null
            this.match.loserTeam = null
            this.match.forfeitTeam = null
            this.match.disconnectedTeam = null
        }

        const reservedTeam = this.clientTeam[clientId]
        let team = null
        const redCount = this.getTeamPlayerCount("red")
        const blueCount = this.getTeamPlayerCount("blue")

        if (reservedTeam && this.hasTeamCapacity(reservedTeam)) {
            const otherTeam = reservedTeam === "red" ? "blue" : "red"
            const reservedTeamCount = this.getTeamPlayerCount(reservedTeam)
            const otherTeamCount = this.getTeamPlayerCount(otherTeam)

            // Keep previous team only if it does not worsen balance.
            if (reservedTeamCount <= otherTeamCount || !this.hasTeamCapacity(otherTeam)) {
                team = reservedTeam
            }
        }

        if (!team && redCount < blueCount && this.hasTeamCapacity("red")) {
            team = "red"
        } else if (!team && blueCount < redCount && this.hasTeamCapacity("blue")) {
            team = "blue"
        }

        if (!team) {
            const preferred = this.lastAutoAssignedTeam === "red" ? "blue" : "red"
            if (this.hasTeamCapacity(preferred)) {
                team = preferred
            } else if (this.hasTeamCapacity(preferred === "red" ? "blue" : "red")) {
                team = preferred === "red" ? "blue" : "red"
            }
        }

        if (!team) {
            return false
        }

        if (!reservedTeam) {
            this.lastAutoAssignedTeam = team
        }

        if (!this.hasTeamCapacity(team)) {
            return false
        }

        if (team !== "red" && team !== "blue") {
            return false
        }

        const { x, y } = this.getSpawnPosition(team)

        const player = new Player(id, x, y, team)
        if (this._dbgPlayerSpeed !== undefined) player.speed = this._dbgPlayerSpeed
        if (this._dbgKickPower !== undefined) player.kickPower = this._dbgKickPower
        if (this._dbgKickRadius !== undefined) player.kickRadius = this._dbgKickRadius
        if (this._dbgPlayerFriction !== undefined) player.friction = this._dbgPlayerFriction
        this.players[id] = player
        this.socketToClient[id] = clientId
        this.clientToSocket[clientId] = id
        this.clientTeam[clientId] = team
        if (!this.hostClientId) {
            this.hostClientId = clientId
        }
        this.playerCount++
        this.startMatchIfReady()
        return true
    }

    removePlayer(id, options = {}) {
        const removedPlayer = this.players[id]
        if (removedPlayer) {
            const clientId = this.socketToClient[id]
            delete this.players[id]
            delete this.socketToClient[id]
            if (clientId) {
                delete this.clientToSocket[clientId]
            }
            if (clientId && this.hostClientId === clientId) {
                this.refreshHostClientId()
            }
            this.pendingKicks.delete(id)
            this.playerCount--

            if (this.match.status === "in_progress" && !options.suppressMatchEnd) {
                const disconnectedTeamCount = this.getTeamPlayerCount(removedPlayer.team)
                if (disconnectedTeamCount < 1) {
                    this.finishMatch({
                        reason: "disconnect",
                        winnerTeam: removedPlayer.team === "red" ? "blue" : "red",
                        disconnectedTeam: removedPlayer.team,
                    })
                }
            }
        }

        if (this.playerCount < this.getReadyPlayerCount() && this.match.status === "waiting") {
            this.match.startedAt = null
        }

        if (this.playerCount === 0 && this.match.status === "finished") {
            this.match.status = "waiting"
            this.match.startedAt = null
            this.match.endedAt = null
            this.match.endReason = null
            this.match.winnerTeam = null
            this.match.loserTeam = null
            this.match.forfeitTeam = null
            this.match.disconnectedTeam = null
            this.score = { red: 0, blue: 0 }
            this.ball.reset()
        }

        if (this.playerCount === 0) {
            this.clientTeam = {}
            this.hostClientId = null
        }
    }

    handleInput(id, input) {
        if (this.players[id] && this.match.status === "in_progress") {
            this.players[id].input = input
        }
    }

    requestKick(id) {
        if (!this.players[id] || this.match.status !== "in_progress") return
        const current = this.pendingKicks.get(id) || 0
        this.pendingKicks.set(id, Math.max(current, 3))
    }

    forfeit(id) {
        const player = this.players[id]
        if (!player || this.match.status !== "in_progress") return

        this.finishMatch({
            reason: "forfeit",
            winnerTeam: player.team === "red" ? "blue" : "red",
            forfeitTeam: player.team,
        })
    }

    update() {
        this.lastSimulationAt = Date.now()

        // Safety net: if enough players are present but match did not transition yet,
        // force the room into in_progress.
        this.startMatchIfReady()

        if (this.match.status !== "in_progress") {
            return
        }

        this.simulationTick++

        Object.values(this.players).forEach((player) => {
            player.update(this.width, this.height)
        })

        const playerArray = Object.values(this.players)
        for (let i = 0; i < playerArray.length; i++) {
            for (let j = i + 1; j < playerArray.length; j++) {
                checkPlayerCollision(playerArray[i], playerArray[j])
            }
        }

        for (let iteration = 0; iteration < 5; iteration++) {
            Object.values(this.players).forEach((player) => {
                checkCollision(player, this.ball)
            })
        }

        this.pendingKicks.forEach((ticksRemaining, id) => {
            const player = this.players[id]
            if (player) {
                handleKick(player, this.ball)
            }

            const nextTicks = ticksRemaining - 1
            if (nextTicks > 0 && this.players[id]) {
                this.pendingKicks.set(id, nextTicks)
            } else {
                this.pendingKicks.delete(id)
            }
        })

        this.ball.update()
        this.checkWalls()

        if (this.match.status === "in_progress" && this.isTimeLimitReached()) {
            this.finishByTimeLimit()
        }
    }

    checkWalls() {
        const ball = this.ball
        const goalTop = (this.height - this.goalHeight) / 2
        const goalBottom = (this.height + this.goalHeight) / 2

        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius
            ball.vy *= -1
        }
        if (ball.y + ball.radius > this.height) {
            ball.y = this.height - ball.radius
            ball.vy *= -1
        }

        if (ball.x - ball.radius < 0) {
            if (ball.y > goalTop && ball.y < goalBottom) {
                this.score.blue++
                if (this.score.blue >= this.rules.scoreLimit) {
                    this.finishMatch({ reason: "score_limit", winnerTeam: "blue" })
                    return
                }
                this.resetAfterGoal()
                return
            }
            ball.x = ball.radius
            ball.vx *= -1
        }

        if (ball.x + ball.radius > this.width) {
            if (ball.y > goalTop && ball.y < goalBottom) {
                this.score.red++
                if (this.score.red >= this.rules.scoreLimit) {
                    this.finishMatch({ reason: "score_limit", winnerTeam: "red" })
                    return
                }
                this.resetAfterGoal()
                return
            }
            ball.x = this.width - ball.radius
            ball.vx *= -1
        }
    }

    resetAfterGoal() {
        if (this.match.status !== "in_progress") return

        this.ball.reset()

        const resetTeam = (team) => {
            const teamPlayers = this.getTeamPlayers(team)
            const totalSlots = teamPlayers.length + 1
            teamPlayers.forEach((player, index) => {
                player.x = team === "red" ? 200 : this.width - 200
                player.y = (this.height / totalSlots) * (index + 1)
                player.vx = 0
                player.vy = 0
            })
        }

        resetTeam("red")
        resetTeam("blue")
    }

    startMatchIfReady() {
        if (this.match.status !== "waiting") return

        const redCount = this.getTeamPlayerCount("red")
        const blueCount = this.getTeamPlayerCount("blue")
        if (redCount >= 1 && blueCount >= 1) {
            this.match.status = "in_progress"
            this.match.startedAt = Date.now()
            this.match.endedAt = null
            this.match.endReason = null
            this.match.winnerTeam = null
            this.match.loserTeam = null
            this.match.forfeitTeam = null
            this.match.disconnectedTeam = null
            this.score = { red: 0, blue: 0 }
            this.ball.reset()
            this.resetAfterGoal()
        }
    }

    isTimeLimitReached() {
        if (!this.match.startedAt) return false
        return (Date.now() - this.match.startedAt) / 1000 >= this.rules.timeLimitSeconds
    }

    finishByTimeLimit() {
        if (this.score.red > this.score.blue) {
            this.finishMatch({ reason: "time_limit", winnerTeam: "red" })
            return
        }

        if (this.score.blue > this.score.red) {
            this.finishMatch({ reason: "time_limit", winnerTeam: "blue" })
            return
        }

        this.finishMatch({ reason: "time_limit_draw", winnerTeam: null })
    }

    finishMatch({ reason, winnerTeam = null, forfeitTeam = null, disconnectedTeam = null }) {
        if (this.match.status === "finished") return

        const loserTeam = winnerTeam ? (winnerTeam === "red" ? "blue" : "red") : null

        this.match.status = "finished"
        this.match.endedAt = Date.now()
        this.match.endReason = reason
        this.match.winnerTeam = winnerTeam
        this.match.loserTeam = loserTeam
        this.match.forfeitTeam = forfeitTeam
        this.match.disconnectedTeam = disconnectedTeam
    }

    getTimeRemainingSeconds() {
        if (!this.match.startedAt || this.match.status !== "in_progress") {
            return this.rules.timeLimitSeconds
        }

        const elapsed = (Date.now() - this.match.startedAt) / 1000
        return Math.max(0, Math.ceil(this.rules.timeLimitSeconds - elapsed))
    }

    normalizeX(x) {
        return Number((x / this.width).toFixed(6))
    }

    normalizeY(y) {
        return Number((y / this.height).toFixed(6))
    }

    getRenderSnapshot() {
        const paddles = Object.values(this.players).map((player) => ({
            id: player.id,
            team: player.team,
            x: player.x,
            y: player.y,
            radius: player.radius,
            normalized: {
                x: this.normalizeX(player.x),
                y: this.normalizeY(player.y),
                radius: Number((player.radius / this.width).toFixed(6)),
            },
        }))

        const goalTop = (this.height - this.goalHeight) / 2

        return {
            ball: {
                x: this.ball.x,
                y: this.ball.y,
                radius: this.ball.radius,
                normalized: {
                    x: this.normalizeX(this.ball.x),
                    y: this.normalizeY(this.ball.y),
                    radius: Number((this.ball.radius / this.width).toFixed(6)),
                },
            },
            paddles,
            court: {
                width: this.width,
                height: this.height,
                goalHeight: this.goalHeight,
                aspectRatio: Number((this.width / this.height).toFixed(6)),
                center: {
                    x: this.width / 2,
                    y: this.height / 2,
                },
                centerCircleRadius: 50,
                leftGoal: {
                    x: 0,
                    y: goalTop,
                    width: 30,
                    height: this.goalHeight,
                },
                rightGoal: {
                    x: this.width - 30,
                    y: goalTop,
                    width: 30,
                    height: this.goalHeight,
                },
            },
        }
    }

    getRoomInfo() {
        const redCount = this.getTeamPlayerCount("red")
        const blueCount = this.getTeamPlayerCount("blue")
        const maxPlayers = this.getMatchCapacity()
        const hostClientId = this.getHostClientId()
        return {
            id: this.id || null,
            title: this.getTitle(),
            createdAt: this.createdAt,
            host: hostClientId,
            isLocked: this.requiresPassword(),
            playerCount: this.playerCount,
            maxPlayers,
            availableSlots: Math.max(0, maxPlayers - this.playerCount),
            isFull: this.playerCount >= maxPlayers,
            teams: {
                red: redCount,
                blue: blueCount,
            },
            minPlayersPerTeam: this.minPlayersPerTeam,
            maxPlayersPerTeam: this.maxPlayersPerTeam,
        }
    }

    getBroadcastState() {
        return {
            players: Object.values(this.players).map((p) => ({
                id: p.id,
                team: p.team,
                x: p.x,
                y: p.y,
            })),
            ball: {
                x: this.ball.x,
                y: this.ball.y,
            },
            score: this.score,
            match: {
                status: this.match.status,
                timeRemainingSeconds: this.getTimeRemainingSeconds(),
            },
            room: this.getRoomInfo(),
            meta: {
                serverTimeMs: Date.now(),
            },
        }
    }

    getState() {
        return {
            players: this.players,
            playerCount: this.playerCount,
            ball: {
                x: this.ball.x,
                y: this.ball.y,
                radius: this.ball.radius,
            },
            score: this.score,
            rules: this.rules,
            room: this.getRoomInfo(),
            match: {
                status: this.match.status,
                endReason: this.match.endReason,
                winnerTeam: this.match.winnerTeam,
                loserTeam: this.match.loserTeam,
                forfeitTeam: this.match.forfeitTeam,
                disconnectedTeam: this.match.disconnectedTeam,
                timeRemainingSeconds: this.getTimeRemainingSeconds(),
            },
            render: this.getRenderSnapshot(),
            overlay: {
                score: this.score,
            },
            viewport: {
                baseWidth: this.width,
                baseHeight: this.height,
                aspectRatio: Number((this.width / this.height).toFixed(6)),
            },
            meta: {
                simulationTick: this.simulationTick,
                serverTimeMs: Date.now(),
                lastSimulationAt: this.lastSimulationAt,
            },
            field: {
                width: this.width,
                height: this.height,
                goalHeight: this.goalHeight,
            },
        }
    }
}

module.exports = GameRoom
