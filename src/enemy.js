// Classe Enemy avec deux hitboxes
class Enemy {
  constructor(x, y, w, h, wallHitboxW, wallHitboxH, wallHitboxOffsetX = 0, wallHitboxOffsetY = 0) {
    // Position et dimensions de la hitbox COMPLÈTE (ne sera pas affectée par les murs)
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    // Dimensions de la hitbox pour les MURS (plus petite)
    this.wallHitboxW = wallHitboxW;
    this.wallHitboxH = wallHitboxH;
    this.wallHitboxOffsetX = wallHitboxOffsetX; // Offset depuis le coin haut-gauche de l'ennemi
    this.wallHitboxOffsetY = wallHitboxOffsetY;

    // Mouvement et physique
    this.vx = 0; // Vélocité X
    this.vy = 0; // Vélocité Y
    this.speed = 1;

    // Animation (optionnel)
    this.sprite = null;          // Un seul sprite (pas d'animation)
    this.sprites = [];           // Plusieurs sprites (animation)
    this.frameIndex = 0;
    this.animTimer = 0;
    this.isMoving = false;
    this.facingLeft = false;

    // HP (optionnel)
    this.hp = 1;
    this.hpmax = 1;
    // À ajouter à la fin du constructor dans enemy.js
    this.moveTimer = 0;
    this.moveDuration = 60; // Il bouge pendant 60 frames (1 sec) avant de changer
  }

  // Vérifie les collisions avec les murs pour la hitbox de mur
  checkWallCollision(nx, ny) {
    // Position de la hitbox de mur
    const wallX = nx + this.wallHitboxOffsetX;
    const wallY = ny + this.wallHitboxOffsetY;

    for (let w of currentWalls) {
      if (rectCollide(wallX, wallY, this.wallHitboxW, this.wallHitboxH, w.x, w.y, w.w, w.h)) {
        return true;
      }
    }
    return false;
  }

  // Met à jour la position de l'ennemi
  // Dans ton fichier enemy.js, modifie la méthode update
update() {
  // 1. GESTION DE L'IA (Mouvement aléatoire)
  if (!this.moveTimer) this.moveTimer = 0; // Sécurité si pas défini

  this.moveTimer--;

  if (this.moveTimer <= 0) {
    // Choisit une direction au hasard (-1, 0 ou 1)
    // On multiplie par speed pour garder un mouvement lent
    this.vx = (Math.random() * 2 - 1) * this.speed;
    this.vy = (Math.random() * 2 - 1) * this.speed;
    
    // Il garde cette direction entre 1 et 3 secondes (60 à 180 frames)
    this.moveTimer = Math.floor(random(60, 180));
  }

  // 2. CALCUL DES PROCHAINES POSITIONS
  let nextX = this.x + this.vx;
  let nextY = this.y + this.vy;

  // 3. COLLISIONS AVEC LES MURS
  // On teste X et Y séparément pour que l'ennemi puisse glisser contre un mur
  if (!this.checkWallCollision(nextX, this.y)) {
    this.x = nextX;
  } else {
    this.vx *= -1; // Rebondit s'il touche un mur vertical
    this.moveTimer = 30; // Changera de direction plus vite
  }

  if (!this.checkWallCollision(this.x, nextY)) {
    this.y = nextY;
  } else {
    this.vy *= -1; // Rebondit s'il touche un mur horizontal
    this.moveTimer = 30;
  }

  // 4. ANIMATION & ORIENTATION
  this.isMoving = (this.vx !== 0 || this.vy !== 0);
  if (this.vx < 0) this.facingLeft = true;
  if (this.vx > 0) this.facingLeft = false;

  // Gestion de l'animation (code de ton binôme)
  if (this.isMoving && this.sprites.length > 0) {
    this.animTimer++;
    if (this.animTimer > 12) {
      this.frameIndex = (this.frameIndex + 1) % this.sprites.length;
      this.animTimer = 0;
    }
  }
}

  // Dessine l'ennemi
  draw() {
    // Cas 1: Un seul sprite (pas d'animation)
    if (this.sprite) {
      push();
      translate(this.x + this.w / 2, this.y + this.h / 2);
      if (this.facingLeft) {
        scale(-1, 1);
      }
      image(this.sprite, -this.w / 2, -this.h / 2, this.w, this.h);
      pop();
    }
    // Cas 2: Plusieurs sprites (animation)
    else if (this.sprites.length > 0) {
      push();
      translate(this.x + this.w / 2, this.y + this.h / 2);
      if (this.facingLeft) {
        scale(-1, 1);
      }
      image(this.sprites[this.frameIndex], -this.w / 2, -this.h / 2, this.w, this.h);
      pop();
    }
    // Cas 3: Pas de sprite, rectangle par défaut
    else {
      fill(255, 0, 0);
      rect(this.x, this.y, this.w, this.h);
    }

    // Debug: afficher les deux hitboxes (commenter pour le rendu final)
    // Hitbox complète (verte)
    stroke(0, 255, 0);
    strokeWeight(2);
    noFill();
    rect(this.x, this.y, this.w, this.h);

    // Hitbox murs (jaune)
    stroke(255, 255, 0);
    strokeWeight(2);
    noFill();
    rect(
      this.x + this.wallHitboxOffsetX,
      this.y + this.wallHitboxOffsetY,
      this.wallHitboxW,
      this.wallHitboxH
    );
  }

  // Retourne true si l'ennemi collide avec le joueur (utilise la hitbox complète)
  collidesWith(obj) {
    return rectCollide(
      this.x,
      this.y,
      this.w,
      this.h,
      obj.x,
      obj.y,
      obj.w,
      obj.h
    );
  }

  // Retourne la hitbox complète (pour les projectiles, etc.)
  getHitbox() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  // Retourne la hitbox de mur
  getWallHitbox() {
    return {
      x: this.x + this.wallHitboxOffsetX,
      y: this.y + this.wallHitboxOffsetY,
      w: this.wallHitboxW,
      h: this.wallHitboxH
    };
  }
}

let mushroomEnemy = null;

function createMushroomEnemy(x, y) {
  mushroomEnemy = new Enemy(x, y, 48, 48, 36, 8, 6, 39);
  mushroomEnemy.sprite = loadImage('./assets/personnage/Mushroom/champi.png');
  mushroomEnemy.hp = 1;
  mushroomEnemy.hpmax = 1;
  mushroomEnemy.speed = 0.5;
  return mushroomEnemy;
}
