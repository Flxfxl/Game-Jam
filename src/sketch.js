let gameStarted = false;

function preload() {
  loadLevel("room1"); 
  
  // DÉCOUPE DU DUCK : Ligne 2 (Y=32), 6 images (32x32px chacune)
  loadImage('./assets/personnage/Canards/ducky_3_spritesheet.png', (sheet) => {
    let sw = 32; 
    let sh = 32; 
    let lineY = 32; 
    for (let i = 0; i < 6; i++) {
      player.sprites[i] = sheet.get(i * sw, lineY, sw, sh);
    }
  });

  if (typeof soundFormats === 'function') {
    soundFormats('mp3');
  }

  player.attackSprite = loadImage(
    './assets/attack/pixil-frame-0.png',
    img => { player.attackSprite = img; },
    err => {
      console.warn("Pas de sprite d'attaque trouvé.");
      player.attackSprite = null;
    }
  );

  if (typeof loadSound === 'function') {
    player.quackSound = loadSound('./sound/Duck Quack - Sound Effect (HD).mp3',
      () => {},
      err => { console.warn('Impossible de charger le son canard :', err); }
    );
  } else {
    console.warn('p5.sound non disponible: le son de canard ne pourra pas jouer.');
    player.quackSound = null;
  }

  // Créer l'ennemi (la fonction create gère maintenant sa propre découpe)
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
  player.update();
  player.draw();
  
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

    // --- COLLISION MORTELLE ---
    if (mushroomEnemy && mushroomEnemy.collidesWith(player)) {
      handleGameOver();
    }
  }

  drawWalls();
  showCoords();
}

function handleGameOver() {
  player.x = 180; 
  player.y = 330;
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