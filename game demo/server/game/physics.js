/**
 * Haxball-style collision system:
 * 1. Dribbling: Elastic collision with momentum transfer
 * 2. Kicking: Impulse applied when kick button is pressed
 * 3. Shooting: Player velocity + kick power combined
 */

/**
 * Top sürme (Dribbling) - Elastic collision with momentum transfer
 * Oyuncu topa dokunduğunda momentum transfer eder
 * 
 * İyileştirilmiş versiyon: Agresif ayırma ile sıkışma önlenir
 */
function checkCollision(player, ball) {
    const dx = ball.x - player.x
    const dy = ball.y - player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDist = player.radius + ball.radius

    if (distance < minDist) {
        // Sıfır bölme hatasını önle
        if (distance === 0) {
            ball.x += 2
            ball.y += 2
            return
        }
        
        // Normalize collision vector (oyuncudan topa doğru)
        const nx = dx / distance
        const ny = dy / distance

        // AGRESIF AYIRMA: İki oyuncu arası sıkışmayı önlemek için
        // topu ve oyuncuyu birlikte iter
        const overlap = minDist - distance
        
        // Topu dışarı it (agresif)
        const ballPush = overlap * 0.7
        ball.x += nx * ballPush
        ball.y += ny * ballPush
        
        // Oyuncuyu da hafifçe geri it
        const playerPush = overlap * 0.3
        player.x -= nx * playerPush
        player.y -= ny * playerPush

        // Elastic collision - momentum transfer
        // Oyuncunun hızının bir kısmı topa aktarılır
        const relativeVx = player.vx - ball.vx
        const relativeVy = player.vy - ball.vy
        const dotProduct = relativeVx * nx + relativeVy * ny

        // Sadece yaklaşan çarpışmalarda momentum aktar
        if (dotProduct > 0) {
            const transferRatio = 0.75
            ball.vx += nx * dotProduct * transferRatio
            ball.vy += ny * dotProduct * transferRatio
        }
    }
}

/**
 * Topa vurma (Kicking) - Impulse application
 * X tuşuna basıldığında topa güçlü bir itme uygulanır
 */
function handleKick(player, ball) {
    const dx = ball.x - player.x
    const dy = ball.y - player.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Top vuruş menzili içinde mi kontrol et
    if (distance < player.kickRadius && distance > 0) {
        // Normalize direction (oyuncudan topa doğru)
        const nx = dx / distance
        const ny = dy / distance

        // Şut çekme: Oyuncunun hareket hızı + vuruş gücü
        // Player momentum + kick power = final ball velocity
        const momentumBoost = 1.5 // Oyuncunun hızından gelen katkı
        ball.vx += nx * player.kickPower + player.vx * momentumBoost
        ball.vy += ny * player.kickPower + player.vy * momentumBoost
    }
}

/**
 * Oyuncu-Oyuncu çarpışması
 * İki oyuncu birbirlerinin içinden geçemez
 */
function checkPlayerCollision(player1, player2) {
    const dx = player2.x - player1.x
    const dy = player2.y - player1.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDist = player1.radius + player2.radius

    if (distance < minDist) {
        // Sıfır bölme hatasını önle
        if (distance === 0) {
            player2.x += 2
            player1.x -= 2
            return
        }

        // Normalize collision vector
        const nx = dx / distance
        const ny = dy / distance

        // Overlap miktarı
        const overlap = minDist - distance

        // Her iki oyuncuyu da eşit oranda ayır
        const halfOverlap = overlap / 2

        player1.x -= nx * halfOverlap
        player1.y -= ny * halfOverlap
        player2.x += nx * halfOverlap
        player2.y += ny * halfOverlap

        // Hız transfer (elastik çarpışma)
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
