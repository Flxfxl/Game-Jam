let player = {
  x: 180,
  y: 330,
  w: 48, 
  h: 48, 
  speed: 2.5,
  hp: 3,
  hpmax: 3,
  
  // Animation
  sprites: [],      // Contiendra [img1, img2]
  frameIndex: 0,    // 0 ou 1 (quelle image afficher)
  animTimer: 0,     // Compteur pour ralentir l'animation
  isMoving: false,  // On n'anime que si le canard avance
  facingLeft: false, // true si le joueur regarde à gauche

  update: function() {
    let nextX = this.x;
    let nextY = this.y;
    this.isMoving = false; // Par défaut, on ne bouge pas

    // Détection des touches
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { nextX -= this.speed; this.isMoving = true; this.facingLeft = true; }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { nextX += this.speed; this.isMoving = true; this.facingLeft = false; }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { nextY -= this.speed; this.isMoving = true; }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { nextY += this.speed; this.isMoving = true; }

    // Collision aux pieds - Vérifier X et Y séparément pour permettre le glissement
    if (!this.checkWallCollision(nextX + 6, this.y + 39, 36, 8)) {
      this.x = nextX;
    }
    if (!this.checkWallCollision(this.x + 6, nextY + 39, 36, 8)) {
      this.y = nextY;
    }

    // GESTION DE L'ANIMATION
    if (this.isMoving) {
      this.animTimer++;
      // Toutes les 12 frames (environ 5 fois par seconde), on change d'image
      if (this.animTimer > 12) {
        this.frameIndex = (this.frameIndex + 1) % 2; // Alterne entre 0 et 1
        this.animTimer = 0;
      }
    } else {
      // Si on ne bouge pas, on remet l'image de repos (la première)
      this.frameIndex = 0;
    }
  },

  checkWallCollision: function(nx, ny, nw, nh) {
    for (let w of currentWalls) {
      if (rectCollide(nx, ny, nw, nh, w.x, w.y, w.w, w.h)) return true;
    }
    return false;
  },

  draw: function() {
    // On dessine l'image correspondante à l'index actuel (0 ou 1)
    if (this.sprites.length > 0) {
      push();
      translate(this.x + this.w / 2, this.y + this.h / 2);
      if (this.facingLeft) {
        scale(-1, 1); // Flip horizontal
      }
      image(this.sprites[this.frameIndex], -this.w / 2, -this.h / 2, this.w, this.h);
      pop();
    }
    
    // Debug collision (pieds)
    fill(255, 255, 0, 60);
    rect(this.x + 6, this.y + 39, 36, 8);
  }
};