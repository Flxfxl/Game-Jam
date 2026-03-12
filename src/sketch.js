let gameStarted = false;

function preload() {
  loadLevel("room1"); 
  
  // On charge les deux PNG du canard
  player.sprites[0] = loadImage('./assets/personnage/Canards/duck1/d1p1.png');
  player.sprites[1] = loadImage('./assets/personnage/Canards/duck1/d1p2.png');
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
  // On s'assure que le canvas fait la taille de la map
  const canvas = createCanvas(900, 600);
  canvas.parent('game-container');

  setupHomeScreen();
  noLoop();
}

function draw() {
  if (!gameStarted) {
    return;
  }

  // On affiche le décor
  background(currentBg);

  // On gère le joueur
  player.update();
  player.draw();
  
  // On gère les ennemis
  if (mushroomEnemy) {
    mushroomEnemy.update();
    mushroomEnemy.draw();

    // --- TEST DE COLLISION ATTAQUE ---
    // On vérifie si la hitbox d'attaque du joueur touche la hitbox de l'ennemi
    if (player.attackHitbox && rectCollide(
      player.attackHitbox.x,
      player.attackHitbox.y,
      player.attackHitbox.w,
      player.attackHitbox.h,
       mushroomEnemy.x,
      mushroomEnemy.y,
      mushroomEnemy.w,
      mushroomEnemy.h
    )) {
      console.log('Ennemi touché ! Il est tué.');
      mushroomEnemy = null; // on le supprime
    }

    // --- TEST DE COLLISION MORTELLE ---
    // On vérifie si l'ennemi touche le joueur
    // Note : On passe l'objet 'player' entier
    if (mushroomEnemy && mushroomEnemy.collidesWith(player)) {
      handleGameOver();
    }
  }

  // On affiche les murs de collision (à masquer pour le rendu final)
  drawWalls();
  
  // Outil de mesure
  showCoords();
}

// Petite fonction pour gérer la défaite
function handleGameOver() {
  console.log("Aie ! Le canard a touché le champignon !");
  
  // Pour l'instant, on peut juste remettre le joueur au début
  player.x = 180; 
  player.y = 330;
  
  // Plus tard, on pourra ajouter un écran "Game Over"
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

  playButton.addEventListener('mouseenter', () => {
    playButtonImage.src = 'assets/button/Play-Click.png';
  });

  playButton.addEventListener('mouseleave', () => {
    playButtonImage.src = 'assets/button/Play-Idle.png';
  });

  playButton.addEventListener('click', () => {
    startGame();
  });
}

function startGame() {
  const homeScreen = document.getElementById('home-screen');
  const gameWrapper = document.getElementById('game-wrapper');

  if (homeScreen) {
    homeScreen.style.display = 'none';
  }

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