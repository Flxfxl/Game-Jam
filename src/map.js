const levels = {
  room1: {
    imagePath: 'assets/map/map.png',
    // On définit les rectangles de collision UNIQUEMENT là où les pieds 
    // du personnage ne doivent pas passer.
    walls: [
      { x: 0, y: 0, w: 900, h: 64 },   //  Mur Nord
      { x:0, y:0, w:1, h:600},  //Mur invisible gauche
      { x:900, y:0, w:1, h:600}, //Mur invisible droite
      { x:0, y:580, w:900, h:20}, //Eau sud
      { x: 515, y: 0, w: 62, h: 420 },  // mur milieu/haut 1
      { x: 516, y: 240, w: 190, h: 182 },    // mur milieu/haut 2
      { x:65, y:178, w:297, h:113}, //mur milieu gauche 1
      { x:302, y:180, w:60, h:305}, //mur milieu gauche 2
      { x:366, y:0, w:60, h:95}, //muret nord
      { x:732, y:130, w:170, h:63}, //muret droite 1
      { x:732, y:453, w:170, h:100}, //muret droite 2
      { x:0, y:545, w:395, h:50},
      { x:0, y:455, w:277, h:145},
      { x:215, y:423, w:145, h:62}
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
  fill(255, 0, 255, 30); 
  for (let w of currentWalls) {
    rect(w.x, w.y, w.w, w.h);
  }
}