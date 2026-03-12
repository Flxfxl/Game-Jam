function preload() {
  loadLevel("room1"); 
  
  // On charge les deux PNG du canard
  player.sprites[0] = loadImage('./assets/personnage/Canards/duck1/d1p1.png');
  player.sprites[1] = loadImage('./assets/personnage/Canards/duck1/d1p2.png');
  
  // Créer le mushroom enemy
  createMushroomEnemy(450, 300);
}

function setup() {
  // On s'assure que le canvas fait la taille de la map
  createCanvas(900, 600);
}

function draw() {
  // On affiche le décor
  background(currentBg);

  // On gère le joueur
  player.update();
  player.draw();
  
  // On gère l'ennemi
  if (mushroomEnemy) {
    mushroomEnemy.update();
    mushroomEnemy.draw();

    // --- TEST DE COLLISION MORTELLE ---
    // On vérifie si l'ennemi touche le joueur
    // Note : On passe l'objet 'player' entier
    if (mushroomEnemy.collidesWith(player)) {
      handleGameOver();
    }
  }

  // On affiche les murs de collision
  drawWalls();
  
  // Outil de mesure
  showCoords();
}

// Petite fonction pour gérer la défaite
function handleGameOver() {
  console.log("Aie ! Le canard a touché le champignon !");
  
  // Pour l'instant, on peut juste remettre le joueur au début
  player.x = 100; 
  player.y = 100;
  
  // Plus tard, on pourra ajouter un écran "Game Over"
}

function showCoords() {
  fill(255, 0, 180, 100);
  noStroke();
  textSize(12);
  text(`X: ${floor(mouseX)} Y: ${floor(mouseY)}`, width - 100, height - 20);
}