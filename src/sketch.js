let gameStarted = false;
let health = 3;
let isInvincible = false;
let gameOver = false;
let gameWon = false;
let duckScrollX = 0;
let gameOverDuckFrames = [];
let gameOverDuckFrameIndex = 0;
let gameOverDuckAnimTimer = 0;
const levelOrder = ['room1', 'room2'];
let currentLevelIndex = 0;
const portalEntryAnimDuration = 120;
let portalEntryAnimTimer = 0;
const levelSettings = {
  room1: {
    playerSpawn: { x: 180, y: 330 },
    portalPos: { x: 820, y: 55 }
  },
  room2: {
    playerSpawn: { x: 180, y: 330 },
    // Niveau 2: portail en haut a gauche.
    portalPos: { x: 20, y: 70 },
    // Spawn quand on arrive par teleportation, proche du portail en haut.
    playerSpawnFromPortal: { x: 110, y: 100 }
  }
};

// PORTAIL
let portal = {
  // Coordonnées ajustées pour être bien visible à droite
  x: 820, 
  y: 55,
  w: 80,
  h: 80,
  spritesApparition: [],
  spritesFermeture: [],
  spritesIdle: [],
  frameIndex: 0,
  animTimer: 0,
  active: false,
  appeared: false
};

const mushroomStartX = 450;
const mushroomStartY = 300;
const mushroomSwarmOffsets = [[-300, -200], [0, 0], [300, 0]];

function getCurrentLevelName() {
  return levelOrder[currentLevelIndex];
}

function getMushroomSpawnCoords() {
  if (getCurrentLevelName() === 'room2') {
    return [[140, 120], [410, 300], [730, 430]];
  }
  return mushroomSwarmOffsets.map(([dx, dy]) => [mushroomStartX + dx, mushroomStartY + dy]);
}

function resetPortalState() {
  portal.active = false;
  portal.appeared = false;
  portal.frameIndex = 0;
  portal.animTimer = 0;
}

function applyCurrentLevelSettings() {
  const levelName = getCurrentLevelName();
  const settings = levelSettings[levelName];
  if (!settings) return;

  portal.x = settings.portalPos.x;
  portal.y = settings.portalPos.y;
}

function placePlayerForLevelEntry(fromPortal = false) {
  const levelName = getCurrentLevelName();
  const settings = levelSettings[levelName];
  if (!settings) return;

  if (fromPortal && settings.playerSpawnFromPortal) {
    player.x = settings.playerSpawnFromPortal.x;
    player.y = settings.playerSpawnFromPortal.y;
    return;
  }

  player.x = settings.playerSpawn.x;
  player.y = settings.playerSpawn.y;
}

function loadCurrentLevel(fromPortal = false) {
  loadLevel(getCurrentLevelName());
  applyCurrentLevelSettings();
  spawnMushroomSwarm(getMushroomSpawnCoords());
  resetPortalState();
  portalEntryAnimTimer = fromPortal ? portalEntryAnimDuration : 0;
  if (fromPortal) portal.active = true;
  placePlayerForLevelEntry(fromPortal);
}

function goToNextLevel() {
  if (currentLevelIndex >= levelOrder.length - 1) {
    gameWon = true;
    return;
  }

  currentLevelIndex++;
  loadCurrentLevel(true);
}

function preload() {
  loadLevel(levelOrder[0]); 
  
  // DUCK ANIMATION
  loadImage('./assets/personnage/Canards/ducky_3_spritesheet.png', (sheet) => {
    let sw = 32, sh = 32, lineY = 32; 
    for (let i = 0; i < 6; i++) {
      player.sprites[i] = sheet.get(i * sw, lineY, sw, sh);
    }
  });

  // GAME OVER DUCK
  loadImage('./assets/personnage/Canards/ducky_2_spritesheet.png', (sheet) => {
    let sw = 32, sh = 32, lineY = 96;
    for (let i = 0; i < 6; i++) {
      gameOverDuckFrames[i] = sheet.get(i * sw, lineY, sw, sh);
    }
  });

  // PORTAIL
  loadImage('./assets/portals/purple_portal.png', (sheet) => {
    for (let i = 0; i < 8; i++) {
      portal.spritesIdle[i] = sheet.get(i * 64, 0, 64, 64);
      portal.spritesApparition[i] = sheet.get(i * 64, 64, 64, 64);
      // 3e ligne du spritesheet (y = 128) = fermeture
      portal.spritesFermeture[i] = sheet.get(i * 64, 128, 64, 64);
    }
  });

  player.attackSprite = loadImage('./assets/attack/pixil-frame-0.png');

  try {
    player.quackSound = new Audio('./sound/Duck Quack - Sound Effect (HD).mp3');
    player.quackSound2 = new Audio('./sound/Saturated_quack.mp3');
  } catch (e) { console.warn("Audio non chargé"); }
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

  if (gameWon) {
    drawVictoryScreen();
    return;
  }

  if (gameOver) {
    drawGameOverScreen();
    return;
  }
  
  player.update();

  // --- EFFET DE CLIGNOTEMENT (INVULNÉRABILITÉ) ---
  // Si le joueur est invincible, on dessine une fois sur deux (modulo 10)
  if (isInvincible) {
    if (frameCount % 10 < 5) {
      player.draw();
    }
  } else {
    player.draw();
  }
  
  // Ennemis
  for (let i = mushroomEnemies.length - 1; i >= 0; i--) {
    const enemy = mushroomEnemies[i];
    enemy.update();
    enemy.draw();

    if (player.attackHitbox && rectCollide(
      player.attackHitbox.x, player.attackHitbox.y, player.attackHitbox.w, player.attackHitbox.h,
      enemy.x, enemy.y, enemy.w, enemy.h
    )) {
      mushroomEnemies.splice(i, 1);
      continue;
    }

    if (enemy.collidesWith(player) && !isInvincible) {
      takeDamage();
    }
  }

  // --- LOGIQUE DU PORTAIL ---
  let shouldDrawPortal = false;
  let useClosingAnim = false;

  if (portalEntryAnimTimer > 0 && getCurrentLevelName() === 'room2') {
    portalEntryAnimTimer--;
    portal.active = true;
    shouldDrawPortal = true;
    useClosingAnim = true;
  }

  if (mushroomEnemies.length === 0) {
    portal.active = true;
    shouldDrawPortal = true;
  }

  if (shouldDrawPortal) {
    updatePortalAnimation(useClosingAnim);
    drawPortal(useClosingAnim);
  }

  if (mushroomEnemies.length === 0 && portal.appeared) {
    let hb = player.getHurtbox();
    if (rectCollide(hb.x, hb.y, hb.w, hb.h, portal.x, portal.y, portal.w, portal.h)) {
      goToNextLevel();
    }
  }

  drawWalls();
  showCoords();
}

function updatePortalAnimation(useClosingAnim = false) {
  if (useClosingAnim) {
    portal.animTimer++;
    if (portal.animTimer > 6) {
      portal.animTimer = 0;
      if (portal.frameIndex < 7) {
        portal.frameIndex++;
      }
    }
    return;
  }

  portal.animTimer++;
  if (portal.animTimer > 6) {
    portal.animTimer = 0;
    if (!portal.appeared) {
      portal.frameIndex++;
      if (portal.frameIndex >= 8) {
        portal.appeared = true;
        portal.frameIndex = 0;
      }
    } else {
      portal.frameIndex = (portal.frameIndex + 1) % 8;
    }
  }
}

function drawPortal(useClosingAnim = false) {
  let img;
  if (useClosingAnim) {
    img = portal.spritesFermeture[portal.frameIndex];
  } else {
    img = portal.appeared ? portal.spritesIdle[portal.frameIndex] : portal.spritesApparition[portal.frameIndex];
  }
  if (img) image(img, portal.x, portal.y, portal.w, portal.h);
}

function takeDamage() {
  if (isInvincible || gameOver) return; 
  health--;
  updateUI();
  if (player.quackSound2) player.quackSound2.play();
  
  isInvincible = true;
  // On remet isInvincible à false après 2 secondes
  setTimeout(() => { 
    isInvincible = false; 
  }, 2000); 

  if (health <= 0) handleGameOver();
}

function handleGameOver() {
  gameOver = true;
  const screen = document.getElementById('game-over-screen');
  if (screen) screen.classList.add('active');
}

function restartGame() {
  currentLevelIndex = 0;
  gameWon = false;
  health = 3;
  updateUI();
  loadCurrentLevel();
  gameOver = false;
  const screen = document.getElementById('game-over-screen');
  if (screen) screen.classList.remove('active');
  loop();
}

function updateUI() {
  let hearts = document.querySelectorAll('.hp-point');
  hearts.forEach((heart, index) => {
    heart.src = index < health ? "assets/hp/hpP.png" : "assets/hp/hpV.png";
  });
}

function drawGameOverScreen() {
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  textAlign(CENTER);
  textSize(50);
  fill(255);
  text("GAME OVER", width/2, height/2);
}

function drawVictoryScreen() {
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  textAlign(CENTER);
  textSize(42);
  fill(255);
  text("VICTOIRE !", width / 2, height / 2 - 12);
  textSize(20);
  text("Tu as termine tous les niveaux.", width / 2, height / 2 + 24);
}

function setupHomeScreen() {
  const btn = document.getElementById('play-button');
  if (btn) btn.onclick = startGame;
}

function startGame() {
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('game-wrapper').classList.add('active');
  currentLevelIndex = 0;
  gameWon = false;
  loadCurrentLevel();
  gameStarted = true;
  loop();
}

function keyPressed() {
  if (gameStarted && !gameOver) player.handleKey(key, keyCode);
}

function showCoords() {
  fill(255, 0, 180, 100);
  text(`X: ${floor(mouseX)} Y: ${floor(mouseY)}`, width - 100, height - 20);
}