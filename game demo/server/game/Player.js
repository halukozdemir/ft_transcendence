class Player {
  constructor(id, x, y, team) {
    this.id = id
    this.x = x
    this.y = y
    this.vx = 0
    this.vy = 0
    this.radius = 15
    this.speed = 0.5
    this.team = team // "red" or "blue"
    this.input = {}
    this.kickRadius = 25 // Vuruş menzili
    this.kickPower = 8 // Vuruş gücü
  }

  update(fieldWidth, fieldHeight) {
    // Apply input forces
    if (this.input.left) this.vx -= this.speed
    if (this.input.right) this.vx += this.speed
    if (this.input.up) this.vy -= this.speed
    if (this.input.down) this.vy += this.speed

    // Update position
    this.x += this.vx
    this.y += this.vy

    // Friction
    this.vx *= 0.9
    this.vy *= 0.9

    // Clamp to field boundaries
    this.x = Math.max(this.radius, Math.min(fieldWidth - this.radius, this.x))
    this.y = Math.max(this.radius, Math.min(fieldHeight - this.radius, this.y))
  }
}

module.exports = Player
