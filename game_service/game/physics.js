/**
 * Haxball-style collision system:
 * 1. Dribbling: Elastic collision with momentum transfer
 * 2. Kicking: Impulse applied when kick button is pressed
 * 3. Shooting: Player velocity + kick power combined
 */

/**
 * Dribbling - Elastic collision with momentum transfer
 */
function checkCollision(player, ball) {
    const dx = ball.x - player.x
    const dy = ball.y - player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDist = player.radius + ball.radius

    if (distance < minDist) {
        if (distance === 0) {
            ball.x += 2
            ball.y += 2
            return
        }

        const nx = dx / distance
        const ny = dy / distance

        const overlap = minDist - distance

        const ballPush = overlap * 0.7
        ball.x += nx * ballPush
        ball.y += ny * ballPush

        const playerPush = overlap * 0.3
        player.x -= nx * playerPush
        player.y -= ny * playerPush

        const relativeVx = player.vx - ball.vx
        const relativeVy = player.vy - ball.vy
        const dotProduct = relativeVx * nx + relativeVy * ny

        if (dotProduct > 0) {
            const transferRatio = 0.75
            ball.vx += nx * dotProduct * transferRatio
            ball.vy += ny * dotProduct * transferRatio
        }
    }
}

/**
 * Kicking - When the X key is pressed
 */
function handleKick(player, ball) {
    const dx = ball.x - player.x
    const dy = ball.y - player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const kickReach = player.kickRadius + 3

    if (distance <= kickReach && distance > 0) {
        const nx = dx / distance
        const ny = dy / distance

        const momentumBoost = 1.5
        ball.vx += nx * player.kickPower + player.vx * momentumBoost
        ball.vy += ny * player.kickPower + player.vy * momentumBoost
        return
    }

    if (distance === 0) {
        const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy)
        const nx = speed > 0 ? player.vx / speed : player.team === "red" ? 1 : -1
        const ny = speed > 0 ? player.vy / speed : 0

        ball.vx += nx * player.kickPower
        ball.vy += ny * player.kickPower
    }
}

/**
 * Player-player collision
 */
function checkPlayerCollision(player1, player2) {
    const dx = player2.x - player1.x
    const dy = player2.y - player1.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDist = player1.radius + player2.radius

    if (distance < minDist) {
        if (distance === 0) {
            player2.x += 2
            player1.x -= 2
            return
        }

        const nx = dx / distance
        const ny = dy / distance

        const overlap = minDist - distance
        const halfOverlap = overlap / 2

        player1.x -= nx * halfOverlap
        player1.y -= ny * halfOverlap
        player2.x += nx * halfOverlap
        player2.y += ny * halfOverlap

        const relativeVx = player1.vx - player2.vx
        const relativeVy = player1.vy - player2.vy
        const dotProduct = relativeVx * nx + relativeVy * ny

        if (dotProduct > 0) {
            const bounceStrength = 0.5
            player1.vx -= nx * dotProduct * bounceStrength
            player1.vy -= ny * dotProduct * bounceStrength
            player2.vx += nx * dotProduct * bounceStrength
            player2.vy += ny * dotProduct * bounceStrength
        }
    }
}

module.exports = { checkCollision, handleKick, checkPlayerCollision }
