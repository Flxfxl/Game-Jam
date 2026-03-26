let player = {
  x: 180,
  y: 330,
  w: 48, 
  h: 48, 
  speed: 2.5,
  hp: 3,
  hpmax: 3,
  
  sprites: [],      
  frameIndex: 0,    
  animTimer: 0,     
  isMoving: false,  
  facingLeft: false, 

  attackSprite: null,
  quackSound: null,
  isAttacking: false,
  attackTimer: 0,
  attackHitboxDuration: 6,
  attackVisualDuration: 12,
  attackCooldown: 60,
  attackCooldownTimer: 0,
  lastDirection: 'right',
  attackDirection: 'right',
  attackStartX: null,
  attackStartY: null,
  attackHitbox: null,

  // Tolérance pour la collision mortelle
  margeCotes: 12,  
  margeHaut: 18,   
  margeBas: 6,

  getHurtbox: function() {
    return {
      x: this.x + this.margeCotes,
      y: this.y + this.margeHaut,
      w: this.w - (this.margeCotes * 2),
      h: this.h - this.margeHaut - this.margeBas
    };
  },

  attack: function() {
    if (this.isAttacking || this.attackCooldownTimer > 0) return;
    this.isAttacking = true;
    this.attackTimer = 0;
    this.attackCooldownTimer = this.attackCooldown;
    this.attackDirection = this.lastDirection;
    this.attackStartX = this.x;
    this.attackStartY = this.y;
    this.facingLeft = (this.lastDirection === 'left');
    this.attackHitbox = this.getAttackHitbox();

    if (this.quackSound && typeof this.quackSound.play === 'function') {
      try {
        this.quackSound.play();
      } catch (e) {
        console.warn('Impossible de jouer le quack:', e);
      }
    }
  },

  handleKey: function(k, kc) {
    if (k === ' ' || kc === 32) { this.attack(); return; }
    if (kc === LEFT_ARROW || k === 'a' || k === 'A') this.lastDirection = 'left';
    if (kc === RIGHT_ARROW || k === 'd' || k === 'D') this.lastDirection = 'right';
    if (kc === UP_ARROW || k === 'w' || k === 'W') this.lastDirection = 'up';
    if (kc === DOWN_ARROW || k === 's' || k === 'S') this.lastDirection = 'down';
  },

  update: function() {
    let nextX = this.x;
    let nextY = this.y;
    this.isMoving = false;

    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { nextX -= this.speed; this.isMoving = true; this.facingLeft = true; this.lastDirection = 'left'; }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { nextX += this.speed; this.isMoving = true; this.facingLeft = false; this.lastDirection = 'right'; }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { nextY -= this.speed; this.isMoving = true; this.lastDirection = 'up'; }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { nextY += this.speed; this.isMoving = true; this.lastDirection = 'down'; }

    // On utilise une petite zone au pied du canard pour les collisions bloquantes
    if (!this.checkWallCollision(nextX + 6, this.y + 39, 36, 8)) this.x = nextX;
    if (!this.checkWallCollision(this.x + 6, nextY + 39, 36, 8)) this.y = nextY;

    if (this.isMoving && this.sprites.length > 0) {
      this.animTimer++;
      if (this.animTimer > 8) {
        this.frameIndex = (this.frameIndex + 1) % this.sprites.length;
        this.animTimer = 0;
      }
    } else {
      this.frameIndex = 0;
    }

    if (this.attackCooldownTimer > 0) this.attackCooldownTimer--;

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
      }
    }
  },

  // Cette fonction vérifie si une zone donnée (nx, ny, nw, nh) touche un mur
  checkWallCollision: function(nx, ny, nw, nh) {
    for (let w of currentWalls) {
      if (rectCollide(nx, ny, nw, nh, w.x, w.y, w.w, w.h)) return true;
    }
    return false;
  },

  // Nouvelle méthode pour vérifier si le corps du joueur touche un mur (pour les dégâts)
  isTouchingWall: function() {
    let hb = this.getHurtbox();
    return this.checkWallCollision(hb.x, hb.y, hb.w, hb.h);
  },

  getAttackHitbox: function() {
    if (!this.isAttacking || this.attackStartX === null) return null;
    let size = this.w * 0.8;
    let offsetX = 0, offsetY = 0;
    if (this.attackDirection === 'left') offsetX = -this.w;
    else if (this.attackDirection === 'right') offsetX = this.w;
    else if (this.attackDirection === 'up') offsetY = -this.h;
    else if (this.attackDirection === 'down') offsetY = this.h;
    return { x: this.attackStartX + offsetX + (this.w - size) / 2, y: this.attackStartY + offsetY + (this.h - size) / 2, w: size, h: size };
  },

  draw: function() {
    if (this.sprites.length > 0) {
      push();
      translate(this.x + this.w / 2, this.y + this.h / 2);
      if (this.facingLeft) scale(-1, 1);
      image(this.sprites[this.frameIndex], -this.w / 2, -this.h / 2, this.w, this.h);
      pop();
    }

    if (this.isAttacking) {
      let offsetX = 0, offsetY = 0, angle = 0;
      if (this.attackDirection === 'left') { offsetX = -this.w; angle = 270; }
      else if (this.attackDirection === 'right') { offsetX = this.w; angle = 90; }
      else if (this.attackDirection === 'up') { offsetY = -this.h; angle = 0; }
      else if (this.attackDirection === 'down') { offsetY = this.h; angle = 180; }

      if (this.attackSprite) {
        push();
        translate(this.attackStartX + this.w / 2 + offsetX, this.attackStartY + this.h / 2 + offsetY);
        rotate(radians(angle));
        image(this.attackSprite, -this.w / 2, -this.h / 2, this.w, this.h);
        pop();
      }
    }

    if (this.attackCooldownTimer > 0) {
      const pct = 1 - this.attackCooldownTimer / this.attackCooldown;
      noStroke(); fill(50, 50, 50, 200); rect(this.x, this.y - 12, this.w, 6);
      fill(0, 200, 0, 220); rect(this.x, this.y - 12, this.w * pct, 6);
    }
  }
};