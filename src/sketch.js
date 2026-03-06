function preload() {
  loadLevel("room1"); 
  
  // On charge les deux PNG du canard
  player.sprites[0] = loadImage('./Asset/Personnage/Canards/duck1/d1p1.png');
  player.sprites[1] = loadImage('./Asset/Personnage/Canards/duck1/d1p2.png');
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

  // On affiche les murs de collision (à masquer pour le rendu final)
  drawWalls();
  
  // Outil de mesure
  showCoords();
}

function showCoords() {
  fill(255, 255, 0);
  noStroke();
  textSize(14);
  text(`X: ${floor(mouseX)} Y: ${floor(mouseY)}`, width - 100, height - 20);
}