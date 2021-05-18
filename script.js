const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

canvas.width = 900
canvas.height = 600

//Global variables
const cellSize = 100
const cellGap = 3
let frame = 0
let defeat = false
let victory = false
let bossMode = false
let score = 0

const projectiles = []
const enemies = []
const bossProjectiles = []
const obstacles = []
const floatingMessages = []

// Player class
class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = cellSize - cellGap * 2
    this.height = cellSize - cellGap * 2
    this.speed = 10
    this.moveLeft = false
    this.moveRight = false
    this.moveUp = false
    this.moveDown = false
    this.shooting = false
    this.alive = true
  }

  update() {
    if (this.moveLeft && this.alive) {
      if (this.x - this.speed > 0) this.x -= this.speed
    } else if (this.moveRight && this.alive) {
      if (this.x + this.speed <= canvas.width - cellSize) this.x += this.speed
    } else if (this.moveUp && this.alive) {
      if (this.y - this.speed > 0) this.y -= this.speed
    } else if (this.moveDown && this.alive) {
      if (this.y + this.speed <= canvas.height - cellSize) this.y += this.speed
    }

    if (this.shooting && this.alive) {
      projectiles.push(new Projectiles(this.x + 50, this.y + 25))
      player.shooting = false
    }
  }

  draw() {
    if (this.alive) {
      context.fillStyle = 'blue'
      context.fillRect(this.x, this.y, this.width, this.height)
    }
  }
}

// Default player starting location
const player = new Player(400, 500)

function handlePlayer() {
  player.update()
  player.draw()

  // Check collision with falling enemies
  for (let i = 0; i < enemies.length; i++) {
    if (player && isColliding(player, enemies[i])) defeat = true
  }

  // Check if Boss is alive and collision with Boss
  if (boss.alive && isColliding(player, boss)) defeat = true
}

// Player Projectiles
class Projectiles {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = 10
    this.height = 10
    this.power = 5
    this.speed = 15
  }

  update() {
    this.y -= this.speed
  }
  draw() {
    context.fillStyle = 'blue'
    context.beginPath()
    context.arc(this.x, this.y, this.width, 0, Math.PI * 2)
    context.fill()
  }
}

function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update()
    projectiles[i].draw()

    // Check collision with falling enemies
    for (let j = 0; j < enemies.length; j++) {
      if (
        enemies[j] &&
        projectiles[i] &&
        isColliding(projectiles[i], enemies[j])
      ) {
        enemies[j].health -= projectiles[i].power
        projectiles.splice(i, 1)
        i--
      }
    }

    // Check collision with boss
    if (bossMode && projectiles[i] && isColliding(boss, projectiles[i])) {
      if (score < 70) score += 1
      floatingMessages.push(
        new FloatingMessage('hit', boss.x, boss.y, 25, 'green')
      )
      projectiles.splice(i, 1)
      i--
    }

    // Check collision with canvas walls
    if (projectiles[i] && projectiles[i].y < 30) {
      projectiles.splice(i, 1)
      i--
    }
  }
}

// Map Obstacles
class Obstacle {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = 50
    this.height = 100
  }

  draw() {
    context.fillStyle = 'orange'
    context.fillRect(this.x, this.y, this.width, this.height)
  }
}
// create 2 obstacles
function createObstacles() {
  obstacles.push(
    new Obstacle(Math.random() * 50 + 75, Math.random() * 50 + 300)
  )

  obstacles.push(
    new Obstacle(Math.random() * 50 + 700, Math.random() * 50 + 350)
  )
}

createObstacles()

function handleObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].draw()

    for (let j = 0; j < enemies.length; j++) {
      if (enemies[j] && obstacles[i] && isColliding(obstacles[i], enemies[j])) {
        enemies.splice(j, 1)
        j++
      }
    }

    // Check collision with player projectiles
    for (let j = 0; j < projectiles.length; j++) {
      if (
        projectiles[j] &&
        obstacles[i] &&
        isColliding(obstacles[i], projectiles[j])
      ) {
        projectiles.splice(j, 1)
        j--
      }
    }
  }
}

// Falling Enemy (divs) class
class Enemy {
  constructor(horizontalPosition) {
    this.x = horizontalPosition
    this.y = 20
    this.width = 50
    this.height = 50
    this.speed = Math.random() * 0.5 + 2
    this.movement = this.speed
    this.health = 10
    this.maxHealth = this.health
  }
  update() {
    this.y += this.movement
  }
  draw() {
    context.fillStyle = 'red'
    context.fillRect(this.x, this.y, this.width, this.height)
  }
}

function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update()
    enemies[i].draw()

    if (enemies[i].health <= 0) {
      if (score < 50) score += 1
      floatingMessages.push(
        new FloatingMessage(
          'hit',
          enemies[i].x + 15,
          enemies[i].y - 30,
          25,
          'green'
        )
      )
      enemies.splice(i, 1)
    } else if (enemies[i].y >= canvas.height - cellSize) {
      floatingMessages.push(
        new FloatingMessage(
          'missed',
          enemies[i].x + 15,
          enemies[i].y - 30,
          25,
          'red'
        )
      )
      enemies.splice(i, 1)
      i--
    }
  }
  if (frame % 24 === 0 && !bossMode) {
    let horizontalPosition = Math.floor(Math.random() * 18) * 50
    enemies.push(new Enemy(horizontalPosition))
  }
}

// Boss class
class Boss {
  constructor(horizontalPosition) {
    this.x = horizontalPosition
    this.y = 20
    this.width = 125
    this.height = 125
    this.movementX = Math.random() * 0.5 + 2
    this.movementY = Math.random() * 0.5 + 3
    this.alive = true
  }

  update() {
    if (this.alive) {
      if (this.x >= canvas.width - this.width || this.x <= 0)
        this.movementX *= -1
      if (this.y >= canvas.height - this.height || this.y <= 0)
        this.movementY *= -1

      for (let i = 0; i < obstacles.length; i++) {
        if (isColliding(this, obstacles[i])) {
          this.movementX *= -1
          this.movementY *= -1
        }
      }

      this.x += this.movementX
      this.y += this.movementY

      if (frame % 30 === 0) {
        bossProjectiles.push(
          new BossProjectiles(this.x + 60, this.y + 60, 'up')
        )
        bossProjectiles.push(
          new BossProjectiles(this.x + 60, this.y + 60, 'down')
        )
        bossProjectiles.push(
          new BossProjectiles(this.x + 60, this.y + 60, 'left')
        )
        bossProjectiles.push(
          new BossProjectiles(this.x + 60, this.y + 60, 'right')
        )
      }
    }
  }

  draw() {
    if (this.alive) {
      context.fillStyle = 'red'
      context.fillRect(this.x, this.y, this.width, this.height)
    }
  }
}

// Default Boss starting
const boss = new Boss(450)

function handleBoss() {
  if (bossMode) {
    boss.update()
    boss.draw()
  }
}

function handleGameStatus() {
  context.fillStyle = 'blue'
  context.font = '30px Orbitron'
  context.fillText('Score: ' + score, 20, 40)

  if (defeat) {
    player.alive = false
    context.fillStyle = 'red'
    context.font = '50px Orbitron'
    context.fillText('YOU ARE DEAD', 250, 75)
  } else if (victory) {
    context.fillStyle = 'green'
    context.font = '50px Orbitron'
    context.fillText('YOU WIN', 350, 75)
  } else if (score >= 30) {
    boss.alive = false
    victory = true
  } else if (score >= 10) {
    bossMode = true
  }
}

// Boss Projectiles class
class BossProjectiles {
  constructor(x, y, dir) {
    this.x = x
    this.y = y
    this.width = 10
    this.height = 10
    this.power = 5
    this.speed = 15
    // direction of projectile
    this.direction = dir
  }
  update() {
    switch (this.direction) {
      case 'up':
        this.y -= this.speed
        break
      case 'down':
        this.y += this.speed
        break
      case 'left':
        this.x -= this.speed
        break
      case 'right':
        this.x += this.speed
        break
    }
  }
  draw() {
    context.fillStyle = 'red'
    context.beginPath()
    context.arc(this.x, this.y, this.width, 0, Math.PI * 2)
    context.fill()
  }
}

function handleBossProjectiles() {
  for (let i = 0; i < bossProjectiles.length; i++) {
    bossProjectiles[i].update()
    bossProjectiles[i].draw()

    // Check collision with obstacles
    for (let j = 0; j < obstacles.length; j++) {
      if (bossProjectiles[i] && isColliding(obstacles[j], bossProjectiles[i])) {
        bossProjectiles.splice(i, 1)
        i--
      }
    }

    // Check collision with player
    if (bossProjectiles[i] && isColliding(player, bossProjectiles[i])) {
      defeat = true
      bossProjectiles.splice(i, 1)
      i--
    }

    // Check collision with canvas walls
    if (bossProjectiles[i]) {
      if (
        bossProjectiles[i].x >= canvas.width - bossProjectiles[i].width ||
        bossProjectiles[i].x <= 0 ||
        bossProjectiles[i].y >= canvas.height - bossProjectiles[i].height ||
        bossProjectiles[i].y <= 0
      ) {
        bossProjectiles.splice(i, 1)
      }
    }
  }
}

// Floating Messages class
class FloatingMessage {
  constructor(value, x, y, size, color) {
    this.value = value
    this.x = x
    this.y = y
    this.size = size
    this.lifeSpan = 0
    this.color = color
    this.opacity = 1
  }

  update() {
    this.y -= 0.3
    this.lifeSpan += 1
    if (this.opacity > 0.03) this.opacity -= 0.03
  }

  draw() {
    context.globalAlpha = this.opacity
    context.fillStyle = this.color
    context.font = this.size + 'px Arial'
    context.fillText(this.value, this.x, this.y)
    context.globalAlpha = 1
  }
}

function handlFloatingMessages() {
  for (let i = 0; i < floatingMessages.length; i++) {
    floatingMessages[i].update()
    floatingMessages[i].draw()

    // delete the message after 100 frames
    if (floatingMessages[i].lifeSpan >= 100) {
      floatingMessages.splice(i, 1)
      i--
    }
  }
}

// Game animation loop
function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  handlePlayer()
  handleProjectiles()
  handleEnemies()
  handleGameStatus()
  handleObstacles()
  handlFloatingMessages()
  handleBoss()
  handleBossProjectiles()
  frame++
  requestAnimationFrame(animate)
}
animate()

// Collision check function
function isColliding(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true
  }
}

// Detect keys pressed
function checkKeyDown(e) {
  e = e || window.event

  // left arrow key down
  if (e.keyCode == '37') {
    player.moveLeft = true
    // right arrow key down
  } else if (e.keyCode == '39') {
    player.moveRight = true
    // up arrow key down
  } else if (e.keyCode == '38') {
    player.moveUp = true
  } else if (e.keyCode == '40') {
    // down arrow key down
    player.moveDown = true
  } else if (e.keyCode == '13') {
    // enter key down
    player.shooting = true
  }
}

function checkKeyUp(e) {
  e = e || window.event
  // left arrow key up
  if (e.keyCode == '37') {
    player.moveLeft = false
    // right arrow key up
  } else if (e.keyCode == '39') {
    player.moveRight = false
    // up arrow key up
  } else if (e.keyCode == '38') {
    player.moveUp = false
    // down arrow key up
  } else if (e.keyCode == '40') {
    player.moveDown = false
    // 'r' key up
  } else if (e.keyCode == '82') {
    location.reload()
  }
}

// Map keys to document keys
document.onkeydown = checkKeyDown
document.onkeyup = checkKeyUp

// Adjust canvas on resize
window.addEventListener('resize', function () {
  canvasPosition = canvas.getBoundingClientRect()
})
