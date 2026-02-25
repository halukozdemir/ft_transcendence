class Ball {
    constructor(fieldWidth, fieldHeight) {
        this.fieldWidth = fieldWidth
        this.fieldHeight = fieldHeight
        this.radius = 10
        this.reset()
    }

    reset() {
        this.x = this.fieldWidth / 2
        this.y = this.fieldHeight / 2
        this.vx = 0
        this.vy = 0
    }

    update() {
        this.x += this.vx
        this.y += this.vy

        // Friction
        this.vx *= 0.99
        this.vy *= 0.99
    }
}

module.exports = Ball
