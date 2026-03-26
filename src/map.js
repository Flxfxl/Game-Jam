// map.js - Fichier entier

const levels = {
  room1: {
    imagePath: 'assets/map/map.png',
    cactusHazards: [],
    walls: [
      { x: 0, y: 0, w: 900, h: 64 },   //  Mur Nord
      { x: 0, y: 0, w: 1, h: 600 },    // Mur invisible gauche
      { x: 900, y: 0, w: 1, h: 600 },  // Mur invisible droite
      { x: 0, y: 580, w: 900, h: 20 }, // Eau sud
      { x: 515, y: 0, w: 62, h: 420 },  // mur milieu/haut 1
      { x: 516, y: 240, w: 190, h: 182 },    // mur milieu/haut 2
      { x: 65, y: 178, w: 297, h: 113 }, // mur milieu gauche 1
      { x: 302, y: 180, w: 60, h: 305 }, // mur milieu gauche 2
      { x: 366, y: 0, w: 60, h: 95 }, // muret nord
      { x: 732, y: 130, w: 170, h: 63 }, // muret droite 1
      { x: 732, y: 453, w: 170, h: 100 }, // muret droite 2
      { x: 0, y: 545, w: 395, h: 50 },
      { x: 0, y: 455, w: 277, h: 145 },
      { x: 215, y: 423, w: 145, h: 62 }
    ]
  },
  room2: {
    imagePath: 'assets/map/map2.png',
    cactusHazards: [
      { x: 105, y: 96, w: 24, h: 26 },
      { x: 210, y: 158, w: 24, h: 26 },
      { x: 472, y: 96, w: 24, h: 26 },
      { x: 650, y: 179, w: 24, h: 26 },
      { x: 296, y: 398, w: 24, h: 26 },
      { x: 419, y: 479, w: 24, h: 26 },
      { x: 579, y: 378, w: 24, h: 26 },
      { x: 30, y: 417, w: 24, h: 26 }
    ],
    walls: [
      { x: 0, y: 0, w: 1, h: 600 }, // mur invisible gauche
      { x: 0, y: 560, w: 900, h: 40 }, // mur du bas
      { x: 0, y: 0, w: 900, h: 60 }, // mur du haut
      { x: 900, y: 0, w: 1, h: 600 }, // mur invisible droite
      { x: 0, y: 262, w: 69, h: 100 }, // 1er bloc gauche
      { x: 70, y: 200, w: 227, h: 161 }, // 1er lac gauche
      { x: 300, y: 181, w: 68, h: 100 }, // 2e bloc à droite du lac
      { x: 157, y: 401, w: 69, h: 100 }, // bloc en dessous du lac
      { x: 370, y: 261, w: 69, h: 100 }, // 2e bloc à droite du lac
      { x: 440, y: 237, w: 250, h: 50 }, // muret central
      { x: 670, y: 341, w: 230, h: 159 }, // lac de droite
      { x: 767, y: 169, w: 35, h: 27 } // caillou en haut à droite    
    ]
  }
};

let currentWalls = [];
let currentBg;
let currentCactusHazards = [];

function loadLevel(levelName) {
  const level = levels[levelName];
  if (level) {
    currentBg = loadImage(level.imagePath);
    currentWalls = level.walls;
    currentCactusHazards = level.cactusHazards || [];
    console.log("Niveau chargé : " + levelName);
  } else {
    console.error("Le niveau " + levelName + " n'existe pas.");
  }
}

function drawWalls() {
  noStroke();

  // 1. SURBRILLANCE DES MURS (Bleu/Violet transparent)
  fill(0, 0, 255, 0); 
  for (let w of currentWalls) {
    rect(w.x, w.y, w.w, w.h);
  }

  // 2. SURBRILLANCE DES CACTUS / ZONES DE DÉGÂTS (Orange/Rouge vif)
  // On met un alpha plus élevé pour bien les voir
  fill(255, 100, 0, 0); 
  for (let c of currentCactusHazards) {
    rect(c.x, c.y, c.w, c.h);
  }
}