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

// TEMPS
let totalGameTime = 0;
let levelStartTime = 0;
let levelTimes = [];

// PORTAIL
let portal = {
  x: 820, 
  y: 55,
  w: 80,
  h: 80,
  spritesApparition: [],
  spritesIdle: [],
  spritesFermeture: [],
  frameIndex: 0,
  animTimer: 0,
  active: false,
  appeared: false,
  closingOnEntry: false,
  closeFrameIndex: 0,
  closeAnimTimer: 0,
  repositionedForEnemiesCleared: false
};

const mushroomStartX = 450;
const mushroomStartY = 300;
const mushroomSwarmOffsets = [[-300, -200], [0, 0], [300, 0]];

function getCurrentLevelName() {
  return levelOrder[currentLevelIndex];
}

function getMushroomSpawnCoords() {
  if (getCurrentLevelName() === 'room2') {
    return [[200, 120], [410, 440], [550, 450], [550, 150]];
  }
  return mushroomSwarmOffsets.map(([dx, dy]) => [mushroomStartX + dx, mushroomStartY + dy]);
}

function resetPortalState() {
  if (getCurrentLevelName() === 'room2') {
    portal.x = 5;
    portal.y = 100;
    portal.closingOnEntry = true;
    portal.closeFrameIndex = 0;
    portal.closeAnimTimer = 0;
  } else {
    portal.x = 820;
    portal.y = 55;
    portal.closingOnEntry = false;
  }
  portal.active = false;
  portal.appeared = false;
  portal.frameIndex = 0;
  portal.animTimer = 0;
  portal.repositionedForEnemiesCleared = false;
}

function loadCurrentLevel() {
  loadLevel(getCurrentLevelName());
  spawnMushroomSwarm(getMushroomSpawnCoords());
  resetPortalState();
  levelStartTime = frameCount;

  if (getCurrentLevelName() === 'room2') {
    player.x = 5;
    player.y = 100;
  } else {
    player.x = 180;
    player.y = 330;
  }
}

function goToNextLevel() {
  let levelTime = frameCount - levelStartTime;
  levelTimes.push(levelTime);
  totalGameTime += levelTime;
  
  if (currentLevelIndex >= levelOrder.length - 1) {
    gameWon = true;
    return;
  }

  currentLevelIndex++;
  loadCurrentLevel();
}

function preload() {
  loadLevel(levelOrder[0]); 
  
  loadImage('./assets/personnage/Canards/ducky_3_spritesheet.png', (sheet) => {
    let sw = 32, sh = 32, lineY = 32; 
    for (let i = 0; i < 6; i++) {
      player.sprites[i] = sheet.get(i * sw, lineY, sw, sh);
    }
  });

  loadImage('./assets/personnage/Canards/ducky_2_spritesheet.png', (sheet) => {
    let sw = 32, sh = 32, lineY = 96;
    for (let i = 0; i < 6; i++) {
      gameOverDuckFrames[i] = sheet.get(i * sw, lineY, sw, sh);
    }
  });

  loadImage('./assets/personnage/Mushroom/sprite/cute mushroom walk.png', (sheet) => {
    let sw = 48, sh = 48;
    for (let i = 0; i < 4; i++) {
      mushroomWalkFrames[i] = sheet.get(i * sw, 0, sw, sh);
    }
  });

  loadImage('./assets/portals/purple_portal.png', (sheet) => {
    for (let i = 0; i < 8; i++) {
      portal.spritesIdle[i] = sheet.get(i * 64, 0, 64, 64);
      portal.spritesApparition[i] = sheet.get(i * 64, 64, 64, 64);
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

  if (isInvincible) {
    if (frameCount % 10 < 5) {
      player.draw();
    }
  } else {
    player.draw();
  }

  // ✅ Vérification des dégâts
  checkCactusDamage();
  checkWallDamage(); // Nouvelle fonction appelée ici
  
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

  if (portal.closingOnEntry) {
    updatePortalClosingAnimation();
    drawPortalClosing();
  }

  if (mushroomEnemies.length === 0) {
    if (!portal.repositionedForEnemiesCleared) {
      portal.repositionedForEnemiesCleared = true;
      if (getCurrentLevelName() === 'room2') {
        portal.x = 10;
        portal.y = 420;
      }
      portal.frameIndex = 0;
      portal.animTimer = 0;
    }
    portal.active = true;
    updatePortalAnimation();
    drawPortal();
    
    if (portal.appeared) {
      let hb = player.getHurtbox();
      if (rectCollide(hb.x, hb.y, hb.w, hb.h, portal.x, portal.y, portal.w, portal.h)) {
        goToNextLevel();
      }
    }
  }

  drawWalls();
  showCoords();
  
  let currentLevelTime = frameCount - levelStartTime;
  let totalTimeFrame = totalGameTime + currentLevelTime;
  drawTimeBox("Total: " + formatTime(totalTimeFrame), 20);
}

// ✅ Nouvelle fonction pour gérer les dégâts des murs
function checkWallDamage() {
  if (isInvincible || gameOver) return;
  if (player.isTouchingWall()) {
    takeDamage();
  }
}

function checkCactusDamage() {
  if (!currentCactusHazards || currentCactusHazards.length === 0 || isInvincible || gameOver) return;

  const hb = player.getHurtbox();
  for (let zone of currentCactusHazards) {
    if (rectCollide(hb.x, hb.y, hb.w, hb.h, zone.x, zone.y, zone.w, zone.h)) {
      takeDamage();
      break;
    }
  }
}

function drawTimeBox(label, yPos) {
  push();
  let boxHeight = 25;
  let boxWidth = 140;
  let boxX = width - boxWidth - 10;
  let boxY = yPos - 5;
  fill(0, 0, 0, 180);
  stroke(0, 0, 0);
  strokeWeight(2);
  rect(boxX, boxY, boxWidth, boxHeight, 5);
  noStroke();
  fill(255, 255, 255);
  textAlign(RIGHT, TOP);
  textSize(16);
  text(label, width - 15, yPos);
  pop();
}

function updatePortalAnimation() {
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

function drawPortal() {
  let img = portal.appeared ? portal.spritesIdle[portal.frameIndex] : portal.spritesApparition[portal.frameIndex];
  if (img) image(img, portal.x, portal.y, portal.w, portal.h);
}

function updatePortalClosingAnimation() {
  portal.closeAnimTimer++;
  if (portal.closeAnimTimer > 6) {
    portal.closeAnimTimer = 0;
    portal.closeFrameIndex++;
    if (portal.closeFrameIndex >= 8) {
      portal.closingOnEntry = false;
      portal.closeFrameIndex = 0;
    }
  }
}

function drawPortalClosing() {
  let img = portal.spritesFermeture[portal.closeFrameIndex];
  if (img) image(img, portal.x, portal.y, portal.w, portal.h);
}

function takeDamage() {
  if (isInvincible || gameOver) return; 
  health--;
  updateUI();
  if (player.quackSound2) player.quackSound2.play();
  
  isInvincible = true;
  // Le canard clignote et devient insensible pendant 2 secondes
  setTimeout(() => { isInvincible = false; }, 2000); 

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
  gameOver = false;
  health = 3;
  isInvincible = false;
  totalGameTime = 0;
  levelTimes = [];
  updateUI();
  loadCurrentLevel();
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

function formatTime(frames) {
  let totalMs = Math.floor((frames / 60) * 1000);
  let seconds = Math.floor(totalMs / 1000);
  let milliseconds = totalMs % 1000;
  return String(seconds) + ':' + String(milliseconds).padStart(3, '0');
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
  text("VICTOIRE !", width / 2, height / 2 - 60);
  textSize(20);
  text("Tu as termine tous les niveaux.", width / 2, height / 2);
  
  textSize(16);
  let yOffset = height / 2 + 50;
  for (let i = 0; i < levelTimes.length; i++) {
    text(levelOrder[i].toUpperCase() + ": " + formatTime(levelTimes[i]), width / 2, yOffset);
    yOffset += 30;
  }
  
  textSize(18);
  fill(255, 215, 0);
  text("TEMPS TOTAL: " + formatTime(totalGameTime), width / 2, yOffset + 15);

  textSize(16);
  fill(255);
  text('Appuyer sur "R" pour recommencer', width / 2, yOffset + 45);
}

function setupHomeScreen() {
  const btn = document.getElementById('play-button');
  if (btn) btn.onclick = startGame;
}

function startGame() {
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('game-wrapper').classList.add('active');
  document.getElementById('game-wrapper').setAttribute('aria-hidden', 'false');
  currentLevelIndex = 0;
  gameWon = false;
  gameOver = false;
  health = 3;
  isInvincible = false;
  totalGameTime = 0;
  levelTimes = [];
  updateUI();
  const screen = document.getElementById('game-over-screen');
  if (screen) screen.classList.remove('active');
  loadCurrentLevel();
  gameStarted = true;
  loop();
}

function keyPressed() {
  if (gameStarted && (key === 'r' || key === 'R')) {
    restartGame();
    return;
  }

  if (gameStarted && !gameOver && !gameWon) player.handleKey(key, keyCode);
}

function showCoords() {
  push(); // 1. On "sauvegarde" l'état du dessin (couleurs, tailles, alignements)
  
  // 2. On définit des réglages spécifiques uniquement pour cette fonction
  fill(255, 0, 180, 200);
  noStroke();
  textSize(14); // <--- On force une petite taille ici !
  textAlign(CENTER, BOTTOM); 
  
  let txt = `X: ${floor(mouseX)} Y: ${floor(mouseY)}`;
  
  // On le place au centre horizontal, à 10px du bas
  text(txt, width / 2, height - 10);
  
  pop(); // 3. On "restaure" l'état précédent pour ne pas casser le reste du jeu
}

// Empêche le défilement de la page avec les flèches et la barre espace
window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);
