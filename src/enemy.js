// Classe Enemy avec deux hitboxes
class Enemy {
  constructor(x, y, w, h, wallHitboxW, wallHitboxH, wallHitboxOffsetX = 0, wallHitboxOffsetY = 0) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.wallHitboxW = wallHitboxW;
    this.wallHitboxH = wallHitboxH;
    this.wallHitboxOffsetX = wallHitboxOffsetX;
    this.wallHitboxOffsetY = wallHitboxOffsetY;

    this.vx = 0;
    this.vy = 0;
    this.speed = 1;

    this.sprites = [];
    this.frameIndex = 0;
    this.animTimer = 0;
    this.isMoving = false;
    this.facingLeft = false;

    this.hp = 1;
    this.moveTimer = 0;
  }

  checkWallCollision(nx, ny) {
    const wallX = nx + this.wallHitboxOffsetX;
    const wallY = ny + this.wallHitboxOffsetY;
    for (let w of currentWalls) {
      if (rectCollide(wallX, wallY, this.wallHitboxW, this.wallHitboxH, w.x, w.y, w.w, w.h)) {
        return true;
      }
    }
    return false;
  }

  update() {
    this.moveTimer--;
    if (this.moveTimer <= 0) {
      this.vx = (Math.random() * 2 - 1) * this.speed;
      this.vy = (Math.random() * 2 - 1) * this.speed;
      this.moveTimer = Math.floor(random(60, 180));
    }

    let nextX = this.x + this.vx;
    let nextY = this.y + this.vy;

    if (!this.checkWallCollision(nextX, this.y)) {
      this.x = nextX;
    } else {
      this.vx *= -1;
      this.moveTimer = 30;
    }

    if (!this.checkWallCollision(this.x, nextY)) {
      this.y = nextY;
    } else {
      this.vy *= -1;
      this.moveTimer = 30;
    }

    this.isMoving = (this.vx !== 0 || this.vy !== 0);
    if (this.vx < 0) this.facingLeft = true;
    if (this.vx > 0) this.facingLeft = false;

    if (this.isMoving && this.sprites.length > 0) {
      this.animTimer++;
      if (this.animTimer > 12) {
        this.frameIndex = (this.frameIndex + 1) % this.sprites.length;
        this.animTimer = 0;
      }
    }
  }

  draw() {
    let imgToDraw = this.sprites.length > 0 ? this.sprites[this.frameIndex] : null;

    if (imgToDraw) {
      push();
      translate(this.x + this.w / 2, this.y + this.h / 2);
      if (this.facingLeft) scale(-1, 1);
      image(imgToDraw, -this.w / 2, -this.h / 2, this.w, this.h);
      pop();
    } else {
      // Fallback si l'image ne charge pas
      fill(255, 0, 0);
      rect(this.x, this.y, this.w, this.h);
    }

    // Debug hitbox masque
    stroke(0, 255, 0, 0);
    noFill();
    rect(this.x, this.y, this.w, this.h);
  }

  collidesWith(obj) {
    let hb = obj.getHurtbox ? obj.getHurtbox() : obj;
    return rectCollide(this.x, this.y, this.w, this.h, hb.x, hb.y, hb.w, hb.h);
  }
}

let mushroomEnemies = [];
let mushroomWalkFrames = [];

function createMushroomEnemy(x, y) {
  const enemy = new Enemy(x, y, 48, 48, 36, 8, 6, 39);
  enemy.speed = 0.5;
  enemy.sprites = mushroomWalkFrames;

  mushroomEnemies.push(enemy);
  return enemy;
}

function clearMushroomEnemies() {
  mushroomEnemies = [];
}

function spawnMushroomSwarm(coordsArray) {
  clearMushroomEnemies();
  coordsArray.forEach(([x, y]) => createMushroomEnemy(x, y));
}
