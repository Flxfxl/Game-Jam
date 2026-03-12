let gameStarted = false;

function preload() {
  loadLevel("room1"); 
  
  // CHARGEMENT ET DÉCOUPE DU CANARD (6 images sur la 2e ligne)
  loadImage('./assets/personnage/Canards/ducky_3_spritesheet.png', (sheet) => {
    let sw = 32; // Largeur d'un sprite
    let sh = 32; // Hauteur d'un sprite
    let lineY = 32; // Début de la 2e ligne (Y=32)
    
    for (let i = 0; i < 6; i++) {
      player.sprites[i] = sheet.get(i * sw, lineY, sw, sh);
    }
  });

  player.attackSprite = loadImage(
    './assets/attack/pixil-frame-0.png',
    img => { player.attackSprite = img; },
    err => {
      console.warn("Pas de sprite d'attaque trouvé dans preload.");
      player.attackSprite = null;
    }
  );

  // Créer le mushroom enemy
  createMushroomEnemy(450, 300);
}

function setup() {
  const canvas = createCanvas(900, 600);
  canvas.parent('game-container');
  setupHomeScreen();
  noLoop();
}

function draw() {
  background(currentBg);
  player.update();
  player.draw();

  if (mushroomEnemy) {
    mushroomEnemy.update();
    mushroomEnemy.draw();

    // Collision mortelle avec Hurtbox asymétrique
    let enemyBox = mushroomEnemy.getHitbox();
    let playerBox = player.getHurtbox();

    if (rectCollide(
      enemyBox.x, enemyBox.y, enemyBox.w, enemyBox.h,
      playerBox.x, playerBox.y, playerBox.w, playerBox.h
    )) {
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
  fill(255, 0, 0, 100);
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