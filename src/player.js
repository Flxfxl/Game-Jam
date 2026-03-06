let player = {
  x: 0,
  y: 0,
  w: 48, 
  h: 48, 
  speed: 4,
  
  // Animation
  sprites: [],      // Contiendra [img1, img2]
  frameIndex: 0,    // 0 ou 1 (quelle image afficher)
  animTimer: 0,     // Compteur pour ralentir l'animation
  isMoving: false,  // On n'anime que si le canard avance

  update: function() {
    let nextX = this.x;
    let nextY = this.y;
    this.isMoving = false; // Par défaut, on ne bouge pas

    // Détection des touches
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { nextX -= this.speed; this.isMoving = true; }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { nextX += this.speed; this.isMoving = true; }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { nextY -= this.speed; this.isMoving = true; }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { nextY += this.speed; this.isMoving = true; }

    // Collision aux pieds
    if (!this.checkWallCollision(nextX, nextY + 35, this.w, 12)) {
      this.x = nextX;
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
      image(this.sprites[this.frameIndex], this.x, this.y, this.w, this.h);
    }
    
    // Debug collision (pieds)
    fill(255, 255, 0, 100);
    rect(this.x, this.y + 35, this.w, 12);
  }
};