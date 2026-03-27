const Player = require("./Player")
const Ball = require("./Ball")
const { checkCollision, handleKick, checkPlayerCollision } = require("./physics")

class GameRoom {
    constructor(options = {}) {
        this.width = 800
        this.height = 500
        this.goalHeight = 150
        this.players = {}
        this.socketToClient = {}
        this.clientToSocket = {}
        this.clientTeam = {}
        this.pendingKicks = new Map()
        this.ball = new Ball(this.width, this.height)
        this.score = { red: 0, blue: 0 }
        this.playerCount = 0
        this.maxPlayersPerTeam = options.maxPlayersPerTeam || 1

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

    getTeamPlayerCount(team) {
        return Object.values(this.players).filter((player) => player.team === team).length
    }

    isTeamFull(team) {
        return this.getTeamPlayerCount(team) >= this.maxPlayersPerTeam
    }

    // Compute evenly-spaced Y positions for n players on a team
    getTeamStartY(slotIndex, totalSlots) {
        return (this.height / (totalSlots + 1)) * (slotIndex + 1)
    }

    addPlayer(id, rawClientId) {
        if (this.playerCount >= this.maxPlayersPerTeam * 2) return false

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

        if (reservedTeam && !this.isTeamFull(reservedTeam)) {
            team = reservedTeam
        } else {
            // Balanced assignment: prefer the team with fewer players
            const redCount = this.getTeamPlayerCount("red")
            const blueCount = this.getTeamPlayerCount("blue")
            if (!this.isTeamFull("red") && redCount <= blueCount) {
                team = "red"
            } else if (!this.isTeamFull("blue")) {
                team = "blue"
            } else if (!this.isTeamFull("red")) {
                team = "red"
            } else {
                return false
            }
        }

        const slotIndex = this.getTeamPlayerCount(team)
        const x = team === "red" ? 200 : this.width - 200
        const y = this.getTeamStartY(slotIndex, this.maxPlayersPerTeam)

        const player = new Player(id, x, y, team)
        if (this._dbgPlayerSpeed !== undefined) player.speed = this._dbgPlayerSpeed
        if (this._dbgKickPower !== undefined) player.kickPower = this._dbgKickPower
        if (this._dbgKickRadius !== undefined) player.kickRadius = this._dbgKickRadius
        if (this._dbgPlayerFriction !== undefined) player.friction = this._dbgPlayerFriction
        this.players[id] = player
        this.socketToClient[id] = clientId
        this.clientToSocket[clientId] = id
        this.clientTeam[clientId] = team
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
            this.pendingKicks.delete(id)
            this.playerCount--

            if (this.match.status === "in_progress" && !options.suppressMatchEnd) {
                // Only forfeit if the entire team is now gone
                if (this.getTeamPlayerCount(removedPlayer.team) === 0) {
                    this.finishMatch({
                        reason: "disconnect",
                        winnerTeam: removedPlayer.team === "red" ? "blue" : "red",
                        disconnectedTeam: removedPlayer.team,
                    })
                }
            }
        }

        if (this.playerCount < 2 && this.match.status === "waiting") {
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

        // Safety net: if two players are present but match did not transition yet,
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

        const redPlayers = Object.values(this.players).filter((p) => p.team === "red")
        const bluePlayers = Object.values(this.players).filter((p) => p.team === "blue")

        redPlayers.forEach((player, i) => {
            player.x = 200
            player.y = this.getTeamStartY(i, this.maxPlayersPerTeam)
            player.vx = 0
            player.vy = 0
        })

        bluePlayers.forEach((player, i) => {
            player.x = this.width - 200
            player.y = this.getTeamStartY(i, this.maxPlayersPerTeam)
            player.vx = 0
            player.vy = 0
        })
    }

    startMatchIfReady() {
        const redCount = this.getTeamPlayerCount("red")
        const blueCount = this.getTeamPlayerCount("blue")
        if (redCount >= 1 && blueCount >= 1 && this.match.status === "waiting") {
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
            maxPlayersPerTeam: this.maxPlayersPerTeam,
            meta: {
                serverTimeMs: Date.now(),
            },
        }
    }

    getState() {
        return {
            players: this.players,
            playerCount: this.playerCount,
            maxPlayersPerTeam: this.maxPlayersPerTeam,
            ball: {
                x: this.ball.x,
                y: this.ball.y,
                radius: this.ball.radius,
            },
            score: this.score,
            rules: this.rules,
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
