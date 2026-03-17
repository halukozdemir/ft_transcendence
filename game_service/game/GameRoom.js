const Player = require("./Player")
const Ball = require("./Ball")
const { checkCollision, handleKick, checkPlayerCollision } = require("./physics")

class GameRoom {
    constructor() {
        this.width = 800
        this.height = 500
        this.goalHeight = 150
        this.players = {}
        this.ball = new Ball(this.width, this.height)
        this.score = { red: 0, blue: 0 }
        this.playerCount = 0
    }

    addPlayer(id) {
        if (this.playerCount >= 2) return false

        const isRed = this.playerCount === 0
        const team = isRed ? "red" : "blue"
        const x = isRed ? 200 : this.width - 200
        const y = this.height / 2

        this.players[id] = new Player(id, x, y, team)
        this.playerCount++
        return true
    }

    removePlayer(id) {
        if (this.players[id]) {
            delete this.players[id]
            this.playerCount--
        }
    }

    handleInput(id, input) {
        if (this.players[id]) {
            this.players[id].input = input
        }
    }

    update() {
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

        Object.values(this.players).forEach((player) => {
            if (player.input.kick) {
                handleKick(player, this.ball)
            }
        })

        this.ball.update()
        this.checkWalls()
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
                this.resetAfterGoal()
                return
            }
            ball.x = ball.radius
            ball.vx *= -1
        }

        if (ball.x + ball.radius > this.width) {
            if (ball.y > goalTop && ball.y < goalBottom) {
                this.score.red++
                this.resetAfterGoal()
                return
            }
            ball.x = this.width - ball.radius
            ball.vx *= -1
        }
    }

    resetAfterGoal() {
        this.ball.reset()

        Object.values(this.players).forEach((player) => {
            if (player.team === "red") {
                player.x = 200
            } else {
                player.x = this.width - 200
            }
            player.y = this.height / 2
            player.vx = 0
            player.vy = 0
        })
    }

    getState() {
        return {
            players: this.players,
            ball: {
                x: this.ball.x,
                y: this.ball.y,
                radius: this.ball.radius,
            },
            score: this.score,
            field: {
                width: this.width,
                height: this.height,
                goalHeight: this.goalHeight,
            },
        }
    }
}

module.exports = GameRoom
