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
  isAttacking: false,
  attackTimer: 0,
  attackDuration: 30, 
  lastDirection: 'right', 
  attackHitbox: null,

  margeCotes: 12,  
  margeHaut: 18,   // Tête tolérante
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
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.attackTimer = 0;
    this.facingLeft = (this.lastDirection === 'left');
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

    if (!this.checkWallCollision(nextX + 6, this.y + 39, 36, 8)) this.x = nextX;
    if (!this.checkWallCollision(this.x + 6, nextY + 39, 36, 8)) this.y = nextY;

    // ANIMATION FLUIDE (Boucle sur les sprites chargés)
    if (this.isMoving && this.sprites.length > 0) {
      this.animTimer++;
      // Vitesse d'animation (8 frames pour 6 images c'est très fluide)
      if (this.animTimer > 8) {
        this.frameIndex = (this.frameIndex + 1) % this.sprites.length;
        this.animTimer = 0;
      }
    } else {
      this.frameIndex = 0;
    }

    if (this.isAttacking) {
      this.attackTimer++;
      if (this.attackTimer >= this.attackDuration) { this.isAttacking = false; this.attackTimer = 0; }
      this.attackHitbox = this.getAttackHitbox();
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
    if (!this.isAttacking) return null;
    let size = this.w * 0.8;
    let offsetX = 0; let offsetY = 0;
    if (this.lastDirection === 'left') offsetX = -this.w;
    else if (this.lastDirection === 'right') offsetX = this.w;
    else if (this.lastDirection === 'up') offsetY = -this.h;
    else if (this.lastDirection === 'down') offsetY = this.h;
    return { x: this.x + offsetX + (this.w - size) / 2, y: this.y + offsetY + (this.h - size) / 2, w: size, h: size };
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
      let offsetX = 0; let offsetY = 0; let angle = 0;
      if (this.lastDirection === 'left') { offsetX = -this.w; angle = 270; }
      else if (this.lastDirection === 'right') { offsetX = this.w; angle = 90; }
      else if (this.lastDirection === 'up') { offsetY = -this.h; angle = 0; }
      else if (this.lastDirection === 'down') { offsetY = this.h; angle = 180; }

      if (this.attackSprite) {
        push();
        translate(this.x + this.w / 2 + offsetX, this.y + this.h / 2 + offsetY);
        rotate(radians(angle));
        image(this.attackSprite, -this.w / 2, -this.h / 2, this.w, this.h);
        pop();
      }
    }
  }
};