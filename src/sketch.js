// let playerPos;
// let speed = 5;

// function setup() {
//   createCanvas(800, 600);
//   // On initialise la position du joueur au centre
//   playerPos = createVector(width / 2, height / 2);
// }

// function draw() {
//   background(50); // Un fond sombre pour le thème

//   // Logique de mouvement
//   if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // 65 c'est la touche 'Q' ou 'A'
//     playerPos.x -= speed;
//   }
//   if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // 68 c'est 'D'
//     playerPos.x += speed;
//   }
//   if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // 87 c'est 'Z' ou 'W'
//     playerPos.y -= speed;
//   }
//   if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // 83 c'est 'S'
//     playerPos.y += speed;
//   }

//   // Dessin du joueur (temporaire)
//   fill(0, 255, 100);
//   rect(playerPos.x, playerPos.y, 40, 40);
// }

// Définition des variables globales
let gameState = "PLAY"; // Peut être "PLAY" ou "GAMEOVER"
let obstaclePos;
let obstacleSize = 50;
let playerSize = 30;

function setup() {
  createCanvas(800, 600);
  // On place l'obstacle aléatoirement sur l'écran
  obstaclePos = createVector(random(width), random(height));
}

function draw() {
  background(30);

  if (gameState === "PLAY") {
    playGame();
  } else if (gameState === "GAMEOVER") {
    showGameOver();
  }
}

// Fonction qui gère la logique du jeu
function playGame() {
  // 1. Dessiner l'obstacle
  fill(255, 50, 50);
  rect(obstaclePos.x, obstaclePos.y, obstacleSize, obstacleSize);

  // 2. Dessiner le joueur (suit la souris)
  // mouseX et mouseY sont des variables natives de p5.js
  fill(50, 150, 255);
  rect(mouseX - playerSize / 2, mouseY - playerSize / 2, playerSize, playerSize);

  // 3. Gestion des collisions (Point crucial pour le barème !)
  // On vérifie si la souris (joueur) entre dans la zone du rectangle rouge
  let hit = collideRectRect(
    mouseX - playerSize / 2, mouseY - playerSize / 2, playerSize, playerSize,
    obstaclePos.x, obstaclePos.y, obstacleSize, obstacleSize
  );

  if (hit) {
    gameState = "GAMEOVER";
  }
}

// Fonction pour l'écran de fin
function showGameOver() {
  fill(255);
  textAlign(CENTER);
  textSize(50);
  text("GAME OVER", width / 2, height / 2);
  
  textSize(20);
  text("Clique pour recommencer", width / 2, height / 2 + 40);
}

// Relancer le jeu au clic
function mousePressed() {
  if (gameState === "GAMEOVER") {
    gameState = "PLAY";
    // On replace l'obstacle ailleurs
    obstaclePos = createVector(random(width), random(height));
  }
}

// Une petite fonction mathématique simple pour la collision de deux rectangles
function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 + w1 > x2 && x1 < x2 + w2 && y1 + h1 > y2 && y1 < y2 + h2;
}