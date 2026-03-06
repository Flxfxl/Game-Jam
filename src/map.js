const levels = {
  room1: {
    imagePath: 'Asset/Map/map.png',
    // On définit les rectangles de collision UNIQUEMENT là où les pieds 
    // du personnage ne doivent pas passer.
    walls: [
      { x: 0, y: 40, w: 800, h: 20 },   // Base du mur Nord (on laisse un peu de visuel au dessus)
      { x: 0, y: 580, w: 800, h: 20 },  // Base du mur Sud
      { x: 0, y: 0, w: 20, h: 600 },    // Mur Ouest
      { x: 780, y: 0, w: 20, h: 600 },  // Mur Est
      { x: 300, y: 250, w: 200, h: 30 } // Un mur interne (ex: un comptoir ou muret)
    ]
  }
};

let currentWalls = [];
let currentBg;

function loadLevel(levelName) {
  const level = levels[levelName];
  // On charge l'image du décor
  currentBg = loadImage(level.imagePath);
  // On récupère les zones de collision
  currentWalls = level.walls;
}

function drawWalls() {
  // Debug : On dessine les zones de collision en rouge très transparent
  // pour vérifier qu'elles sont bien placées à la BASE des murs dessinés.
  noStroke();
  fill(255, 0, 0, 80); 
  for (let w of currentWalls) {
    rect(w.x, w.y, w.w, w.h);
  }
}