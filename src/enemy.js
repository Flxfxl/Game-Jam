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

    // --- MODIFICATION ICI ---
    this.sprites = []; // On utilise ce tableau pour l'animation
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

    // --- LOGIQUE D'ANIMATION ---
    if (this.isMoving && this.sprites.length > 0) {
      this.animTimer++;
      if (this.animTimer > 12) { // Vitesse du dandinement
        this.frameIndex = (this.frameIndex + 1) % this.sprites.length;
        this.animTimer = 0;
      }
    }
  }

  draw() {
    // --- MODIFICATION ICI : On dessine le sprite animé en priorité ---
    let imgToDraw = (this.sprites.length > 0) ? this.sprites[this.frameIndex] : null;

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

    // Debug Hitbox (tu peux mettre l'alpha à 0 pour cacher)
    stroke(0, 255, 0, 50); 
    noFill();
    rect(this.x, this.y, this.w, this.h);
  }

  collidesWith(obj) {
    let hb = obj.getHurtbox ? obj.getHurtbox() : obj;
    return rectCollide(this.x, this.y, this.w, this.h, hb.x, hb.y, hb.w, hb.h);
  }
}

let mushroomEnemy = null;

// --- FONCTION DE CRÉATION MISE À JOUR ---
function createMushroomEnemy(x, y) {
  mushroomEnemy = new Enemy(x, y, 48, 48, 36, 8, 6, 39);
  mushroomEnemy.speed = 0.5;

  // On charge la planche de 4 images et on la découpe
  loadImage('./assets/personnage/Mushroom/sprite/cute mushroom walk.png', (sheet) => {
    let sw = 48; // Largeur d'une frame (on suppose 48px)
    let sh = 48; // Hauteur d'une frame
    
    for (let i = 0; i < 4; i++) {
      mushroomEnemy.sprites[i] = sheet.get(i * sw, 0, sw, sh);
    }
  });

  return mushroomEnemy;
}