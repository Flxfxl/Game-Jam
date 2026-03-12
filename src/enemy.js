// Classe Enemy avec deux hitboxes
class Enemy {
  constructor(x, y, w, h, wallHitboxW, wallHitboxH, wallHitboxOffsetX = 0, wallHitboxOffsetY = 0) {
    // Hitbox complète (corps)
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    // Hitbox pour les murs (pieds)
    this.wallHitboxW = wallHitboxW;
    this.wallHitboxH = wallHitboxH;
    this.wallHitboxOffsetX = wallHitboxOffsetX; 
    this.wallHitboxOffsetY = wallHitboxOffsetY;

    // Mouvement
    this.vx = 0;
    this.vy = 0;
    this.speed = 1;

    // Animation
    this.sprite = null;          // Image fixe (fallback)
    this.sprites = [];           // Tableau pour les frames animées
    this.frameIndex = 0;
    this.animTimer = 0;
    this.isMoving = false;
    this.facingLeft = false;

    // IA et Vie
    this.hp = 1;
    this.hpmax = 1;
    this.moveTimer = 0;
  }

  // Détection des murs
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
    // 1. IA : Changement de direction aléatoire
    this.moveTimer--;
    if (this.moveTimer <= 0) {
      this.vx = (Math.random() * 2 - 1) * this.speed;
      this.vy = (Math.random() * 2 - 1) * this.speed;
      this.moveTimer = Math.floor(random(60, 180));
    }

    let nextX = this.x + this.vx;
    let nextY = this.y + this.vy;

    // 2. Mouvement avec rebond sur les murs
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

    // 3. Gestion de l'état (Moving / Facing)
    this.isMoving = (this.vx !== 0 || this.vy !== 0);
    if (this.vx < 0) this.facingLeft = true;
    if (this.vx > 0) this.facingLeft = false;

    // 4. Animation : On boucle sur les sprites si chargés
    if (this.isMoving && this.sprites.length > 0) {
      this.animTimer++;
      if (this.animTimer > 12) {
        this.frameIndex = (this.frameIndex + 1) % this.sprites.length;
        this.animTimer = 0;
      }
    }
  }

  draw() {
    // Choix de l'image (animée en priorité, sinon fixe, sinon rectangle rouge)
    let imgToDraw = null;
    if (this.sprites.length > 0) {
      imgToDraw = this.sprites[this.frameIndex];
    } else if (this.sprite) {
      imgToDraw = this.sprite;
    }

    if (imgToDraw) {
      push();
      translate(this.x + this.w / 2, this.y + this.h / 2);
      if (this.facingLeft) scale(-1, 1);
      image(imgToDraw, -this.w / 2, -this.h / 2, this.w, this.h);
      pop();
    } else {
      fill(255, 0, 0);
      rect(this.x, this.y, this.w, this.h);
    }

    // Debug: Hitbox complète (verte) et murs (jaune) - Mettre l'alpha à 0 pour cacher
    stroke(0, 255, 0, 0); 
    noFill();
    rect(this.x, this.y, this.w, this.h);
    stroke(255, 255, 0, 0);
    rect(this.x + this.wallHitboxOffsetX, this.y + this.wallHitboxOffsetY, this.wallHitboxW, this.wallHitboxH);
  }

  collidesWith(obj) {
    // Vérifie si l'ennemi touche la zone de vulnérabilité du joueur
    let target = obj.getHurtbox ? obj.getHurtbox() : obj;
    return rectCollide(this.x, this.y, this.w, this.h, target.x, target.y, target.w, target.h);
  }

  getHitbox() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
}

let mushroomEnemy = null;

function createMushroomEnemy(x, y) {
  // Création avec les réglages de ton binôme (48x48)
  mushroomEnemy = new Enemy(x, y, 48, 48, 36, 8, 6, 39);
  mushroomEnemy.speed = 0.5;

  // DÉCOUPE DE LA SPRITESHEET (4 images sur une seule ligne)
  loadImage('./assets/personnage/Mushroom/sprite/cute mushroom walk.png', (sheet) => {
    let sw = 48; // Largeur d'une frame
    let sh = 48; // Hauteur d'une frame
    
    for (let i = 0; i < 4; i++) {
      mushroomEnemy.sprites[i] = sheet.get(i * sw, 0, sw, sh);
    }
  });

  return mushroomEnemy;
}