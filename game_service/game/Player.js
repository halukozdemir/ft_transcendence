class Player {
  constructor(id, x, y, team) {
    this.id = id
    this.x = x
    this.y = y
    this.vx = 0
    this.vy = 0
    this.radius = 15
    this.speed = 0.5
    this.friction = 0.9
    this.team = team 
    this.input = {}
    this.kickRadius = 25 
    this.kickPower = 8 
  }

  update(fieldWidth, fieldHeight) {
    
    if (this.input.left) this.vx -= this.speed
    if (this.input.right) this.vx += this.speed
    if (this.input.up) this.vy -= this.speed
    if (this.input.down) this.vy += this.speed

    
    this.x += this.vx
    this.y += this.vy

    
    this.vx *= this.friction
    this.vy *= this.friction

    
    this.x = Math.max(this.radius, Math.min(fieldWidth - this.radius, this.x))
    this.y = Math.max(this.radius, Math.min(fieldHeight - this.radius, this.y))
  }
}

module.exports = Player
