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

  // Attaque
  attackSprite: null,
  isAttacking: false,
  attackTimer: 0,
  attackHitboxDuration: 6, // 6 frames = 0.1s @ 60fps
  attackVisualDuration: 12, // 12 frames = 0.2s @ 60fps
  attackCooldown: 60, // 60 frames = 1s @ 60fps
  attackCooldownTimer: 0,
  lastDirection: 'right', // 'left' ou 'right' ou 'up' ou 'down'
  attackDirection: 'right',
  attackStartX: null,
  attackStartY: null,
  attackHitbox: null,

  attack: function() {
    if (this.isAttacking || this.attackCooldownTimer > 0) return;
    this.isAttacking = true;
    this.attackTimer = 0;
    this.attackCooldownTimer = this.attackCooldown;

    // On fixe direction et position d'attaque dès le départ
    this.attackDirection = this.lastDirection;
    this.attackStartX = this.x;
    this.attackStartY = this.y;

    // on conserve la direction précédente pour l'attaque visuelle
    this.facingLeft = (this.lastDirection === 'left');

    // on initialise la hitbox d'attaque qui ne bougera plus
    this.attackHitbox = this.getAttackHitbox();
  },

  handleKey: function(k, kc) {
    // Attaque par la touche Espace
    if (k === ' ' || kc === 32) {
      this.attack();
      return;
    }

    // Mémoriser la direction même sans mouvement continu
    if (kc === LEFT_ARROW || k === 'a' || k === 'A') {
      this.lastDirection = 'left';
    }
    if (kc === RIGHT_ARROW || k === 'd' || k === 'D') {
      this.lastDirection = 'right';
    }
    if (kc === UP_ARROW || k === 'w' || k === 'W') {
      this.lastDirection = 'up';
    }
    if (kc === DOWN_ARROW || k === 's' || k === 'S') {
      this.lastDirection = 'down';
    }
  },

  update: function() {
    let nextX = this.x;
    let nextY = this.y;
    this.isMoving = false; // Par défaut, on ne bouge pas

    // Détection des touches
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      nextX -= this.speed;
      this.isMoving = true;
      this.facingLeft = true;
      this.lastDirection = 'left';
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      nextX += this.speed;
      this.isMoving = true;
      this.facingLeft = false;
      this.lastDirection = 'right';
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
      nextY -= this.speed;
      this.isMoving = true;
      this.lastDirection = 'up';
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
      nextY += this.speed;
      this.isMoving = true;
      this.lastDirection = 'down';
    }

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

    // Compteur d'attaque
    if (this.attackCooldownTimer > 0) {
      this.attackCooldownTimer--;
    }

    if (this.isAttacking) {
      this.attackTimer++;

      if (this.attackTimer <= this.attackHitboxDuration) {
        this.attackHitbox = this.getAttackHitbox();
      } else {
        this.attackHitbox = null;
      }

      if (this.attackTimer >= this.attackVisualDuration) {
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackStartX = null;
        this.attackStartY = null;
        this.attackDirection = this.lastDirection;
      }
    } else {
      this.attackHitbox = null;
    }
  },

  checkWallCollision: function(nx, ny, nw, nh) {
    for (let w of currentWalls) {
      if (rectCollide(nx, ny, nw, nh, w.x, w.y, w.w, w.h)) return true;
    }
    return false;
  },

  getAttackHitbox: function() {
    if (!this.isAttacking || this.attackStartX === null || this.attackStartY === null) return null;

    let size = this.w * 0.8;
    let offsetX = 0;
    let offsetY = 0;

    if (this.attackDirection === 'left') {
      offsetX = -this.w;
    } else if (this.attackDirection === 'right') {
      offsetX = this.w;
    } else if (this.attackDirection === 'up') {
      offsetY = -this.h;
    } else if (this.attackDirection === 'down') {
      offsetY = this.h;
    }

    return {
      x: this.attackStartX + offsetX + (this.w - size) / 2,
      y: this.attackStartY + offsetY + (this.h - size) / 2,
      w: size,
      h: size
    };
  },

  draw: function() {
    // On dessine le joueur en permanence
    if (this.sprites.length > 0) {
      push();
      translate(this.x + this.w / 2, this.y + this.h / 2);
      if (this.facingLeft) {
        scale(-1, 1); // Flip horizontal
      }
      image(this.sprites[this.frameIndex], -this.w / 2, -this.h / 2, this.w, this.h);
      pop();
    }

    // Si on attaque, on dessine l'attaque en offset par rapport à la position / direction de départ
    if (this.isAttacking && this.attackStartX !== null && this.attackStartY !== null) {
      let offsetX = 0;
      let offsetY = 0;
      let attackW = this.w;
      let attackH = this.h;
      let angle = 0; // en degrés

      if (this.attackDirection === 'left') {
        offsetX = -this.w;
        angle = 270;
      } else if (this.attackDirection === 'right') {
        offsetX = this.w;
        angle = 90;
      } else if (this.attackDirection === 'up') {
        offsetY = -this.h;
        angle = 0;
      } else if (this.attackDirection === 'down') {
        offsetY = this.h;
        angle = 180;
      }

      if (this.attackSprite) {
        push();
        translate(this.attackStartX + this.w / 2 + offsetX, this.attackStartY + this.h / 2 + offsetY);
        rotate(radians(angle));
        image(this.attackSprite, -attackW / 2, -attackH / 2, attackW, attackH);
        pop();
      } else {
        // dessin de fallback rouge semi-translucide
        push();
        translate(this.attackStartX + this.w / 2 + offsetX, this.attackStartY + this.h / 2 + offsetY);
        rotate(radians(angle));
        noFill();
        stroke(255, 70, 70);
        strokeWeight(3);
        rectMode(CENTER);
        rect(0, 0, attackW, attackH);
        pop();
      }
    }

    // Debug collision (pieds)
    fill(255, 255, 0, 60);
    rect(this.x + 6, this.y + 39, 36, 8);

    // Debug hitbox d'attaque
    if (this.attackHitbox) {
      noFill();
      stroke(0, 200, 255);
      strokeWeight(2);
      rect(this.attackHitbox.x, this.attackHitbox.y, this.attackHitbox.w, this.attackHitbox.h);
    }

    // Barre de cooldown d'attaque au-dessus du joueur
    if (this.attackCooldownTimer > 0) {
      const barW = this.w;
      const barH = 6;
      const pct = 1 - this.attackCooldownTimer / this.attackCooldown;
      const fillW = barW * pct;
      noStroke();
      fill(50, 50, 50, 200);
      rect(this.x, this.y - 12, barW, barH);
      fill(0, 200, 0, 220);
      rect(this.x, this.y - 12, fillW, barH);
      stroke(255);
      noFill();
      rect(this.x, this.y - 12, barW, barH);
    }
  }
};