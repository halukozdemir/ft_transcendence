class Ball {
    constructor(fieldWidth, fieldHeight) {
        this.fieldWidth = fieldWidth
        this.fieldHeight = fieldHeight
        this.radius = 10
        this.friction = 0.975
        this.maxSpeed = 10.8
        this.reset()
    }

    reset() {
        this.x = this.fieldWidth / 2
        this.y = this.fieldHeight / 2
        this.vx = 0
        this.vy = 0
    }

    update() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        if (speed > this.maxSpeed) {
            const ratio = this.maxSpeed / speed
            this.vx *= ratio
            this.vy *= ratio
        }

        this.x += this.vx
        this.y += this.vy

        
        this.vx *= this.friction
        this.vy *= this.friction

        
        if (Math.abs(this.vx) < 0.01) this.vx = 0
        if (Math.abs(this.vy) < 0.01) this.vy = 0
    }
}

module.exports = Ball
