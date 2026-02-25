/**
 * Circle-circle collision between player and ball.
 * Pushes the ball away from the player on impact.
 */
function checkCollision(player, ball) {
    const dx = player.x - ball.x
    const dy = player.y - ball.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDist = player.radius + ball.radius

    if (distance < minDist && distance > 0) {
        // Normalize collision vector
        const nx = dx / distance
        const ny = dy / distance

        // Separate ball from player (prevent overlap)
        ball.x = player.x - nx * minDist
        ball.y = player.y - ny * minDist

        // Transfer velocity — ball bounces away from player
        const pushStrength = 5
        ball.vx = -nx * pushStrength
        ball.vy = -ny * pushStrength
    }
}

module.exports = { checkCollision }
