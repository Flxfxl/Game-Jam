let gameStarted = false;
let health = 3;
let isInvincible = false; // Pour empêcher de perdre tous ses PV d'un coup

function preload() {
  loadLevel("room1"); 
  
  // DÉCOUPE DU DUCK
  loadImage('./assets/personnage/Canards/ducky_3_spritesheet.png', (sheet) => {
    let sw = 32; 
    let sh = 32; 
    let lineY = 32; 
    for (let i = 0; i < 6; i++) {
      player.sprites[i] = sheet.get(i * sw, lineY, sw, sh);
    }
  });

  player.attackSprite = loadImage(
    './assets/attack/pixil-frame-0.png',
    img => { player.attackSprite = img; },
    err => {
      console.warn("Pas de sprite d'attaque trouvé.");
      player.attackSprite = null;
    }
  );

  // Charger le son de quack via l'API HTML5 Audio (indépendant de p5.sound)
  try {
    player.quackSound = new Audio('./sound/Duck Quack - Sound Effect (HD).mp3');
    player.quackSound2 = new Audio('./sound/Saturated_quack.mp3');
    player.quackSound.volume = 0.75;
    player.quackSound.addEventListener('error', (e) => {
      console.warn('Impossible de charger le son de canard', e);
      player.quackSound = null;
    });
  } catch (e) {
    console.warn('Erreur création du son de canard:', e);
    player.quackSound = null;
  }

  createMushroomEnemy(450, 300);
}

function setup() {
  const canvas = createCanvas(900, 600);
  canvas.parent('game-container');
  setupHomeScreen();
  noLoop();
}

function draw() {
  if (!gameStarted) return;

  background(currentBg);
  
  // Faire clignoter le joueur s'il est invincible
  if (isInvincible && frameCount % 10 < 5) {
    // On ne dessine rien ou on change l'alpha pour l'effet de clignotement
  } else {
    player.draw();
  }
  
  player.update();
  
  if (mushroomEnemy) {
    mushroomEnemy.update();
    mushroomEnemy.draw();

    // --- COLLISION ATTAQUE ---
    if (player.attackHitbox && rectCollide(
      player.attackHitbox.x, player.attackHitbox.y, player.attackHitbox.w, player.attackHitbox.h,
      mushroomEnemy.x, mushroomEnemy.y, mushroomEnemy.w, mushroomEnemy.h
    )) {
      console.log('Ennemi tué !');
      mushroomEnemy = null; 
    }

    // --- COLLISION : LE JOUEUR EST TOUCHÉ (Seulement si non invincible) ---
    if (mushroomEnemy && mushroomEnemy.collidesWith(player) && !isInvincible) {
      takeDamage();
    }
  }

  drawWalls();
  showCoords();
}

// --- GESTION DES DÉGÂTS AVEC RECUL ---
// --- GESTION DES DÉGÂTS (SANS RECUL + INVINCIBILITÉ ALLONGÉE) ---
function takeDamage() {
  if (isInvincible) return; 

  health--;
  updateUI();

  // Joue le son de douleur
  if (player.quackSound2) player.quackSound2.play();

  // On active l'invincibilité
  isInvincible = true;

  // On passe à 2000ms (2 secondes)
  setTimeout(() => { 
    isInvincible = false; 
  }, 2000); 

  if (health <= 0) {
    handleGameOver();
  }
}

// Fonction pour recommencer (à appeler via le bouton du Game Over)
function restartGame() {
  health = 3;
  updateUI();
  player.x = 180;
  player.y = 330;
  isInvincible = false;
  
  const screen = document.getElementById('game-over-screen');
  if(screen) screen.classList.remove('active');
  
  gameStarted = true;
  loop();
}

function updateUI() {
  let hearts = document.querySelectorAll('.hp-point');
  hearts.forEach((heart, index) => {
    if (index < health) {
      heart.src = "assets/hp/hpP.png";
    } else {
      heart.src = "assets/hp/hpV.png";
    }
  });
}

function showCoords() {
  fill(255, 0, 180, 100);
  noStroke();
  textSize(12);
  text(`X: ${floor(mouseX)} Y: ${floor(mouseY)}`, width - 100, height - 20);
}

function setupHomeScreen() {
  const playButton = document.getElementById('play-button');
  const playButtonImage = document.getElementById('play-button-image');
  if (!playButton || !playButtonImage) {
    gameStarted = true;
    loop();
    return;
  }
  playButton.addEventListener('mouseenter', () => { playButtonImage.src = 'assets/button/Play-Click.png'; });
  playButton.addEventListener('mouseleave', () => { playButtonImage.src = 'assets/button/Play-Idle.png'; });
  playButton.addEventListener('click', () => { startGame(); });
}

function startGame() {
  const homeScreen = document.getElementById('home-screen');
  const gameWrapper = document.getElementById('game-wrapper');
  if (homeScreen) homeScreen.style.display = 'none';
  if (gameWrapper) {
    gameWrapper.classList.add('active');
    gameWrapper.setAttribute('aria-hidden', 'false');
  }
  gameStarted = true;
  loop();
}

function keyPressed() {
  player.handleKey(key, keyCode);
}