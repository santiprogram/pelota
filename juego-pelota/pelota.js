let video;
let poseNet;
let pose;
let playerX = 300;
let balls = [];
let score = 0;
let lives = 3;
let gameOver = false;

let motivationalMessage = "";
let motivationalTimer;

let heartImg;

function preload() {
  heartImg = loadImage('img/corazon2.png'); // usa tu propia imagen local
}

function setup() {
  createCanvas(600, 400);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  if (typeof ml5 === 'undefined') {
    console.error('ml5 no está cargado. Revisa el script en tu HTML.');
    noLoop();
    return;
  }

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);

  setInterval(spawnBall, 2000);
}

function modelReady() {
  console.log("PoseNet listo");
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    if (pose.nose) {
      playerX = map(pose.nose.x, 0, video.width, width, 0);
    }
  }
}

function draw() {
  background(30);

  if (gameOver) {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("GAME OVER\nPuntaje: " + score, width / 2, height / 2);
    return;
  }

  // Dibujar jugador (barra)
  let baseWidth = score >= 30 ? 50 : 80; // más difícil después de 30 puntos
  fill(0, 255, 0);
  rect(playerX - baseWidth / 2, height - 30, baseWidth, 20);

  // Dibujar pelotas
  for (let i = balls.length - 1; i >= 0; i--) {
    let b = balls[i];
    fill(255, 0, 0);
    ellipse(b.x, b.y, 20);
    b.y += 4;

    if (b.y > height - 40 && abs(b.x - playerX) < baseWidth / 2 + 10) {
      lives--;
      balls.splice(i, 1);
      if (lives <= 0) {
        gameOver = true;
      }
    } else if (b.y > height) {
      balls.splice(i, 1);
      score++;
      updateMotivationalMessage();
    }
  }

  // Dibujar HUD
  fill(255);
  textSize(16);
  textAlign(LEFT);
  text("Puntaje: " + score, 10, 20);

  // Dibujar corazones
  for (let i = 0; i < lives; i++) {
    image(heartImg, 10 + i * 30, 40, 20, 20);
  }

  // Dibujar mensaje motivacional
  if (motivationalMessage) {
    textSize(24);
    textAlign(CENTER);
    fill(255, 215, 0);
    text(motivationalMessage, width / 2, height / 2 - 100);
  }
}

function spawnBall() {
  if (!gameOver) {
    let extraBalls = floor(score / 10); // más pelotas cada 10 puntos
    for (let i = 0; i < 1 + extraBalls; i++) {
      balls.push({ x: random(20, width - 20), y: 0 });
    }
  }
}

function updateMotivationalMessage() {
  let thresholds = [10, 20, 30, 50, 100];
  let messages = [
    "¡Sigue así!",
    "¡Muy bien!",
    "¡Asombroso!",
    "¡Legendario!",
    "¡Increíble Maestro!"
  ];

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (score >= thresholds[i]) {
      // Aumentar dificultad para mostrar mensaje
      let cost = score >= 100 ? 10 : 5;
      if (score % cost === 0) {
        motivationalMessage = messages[i];
        clearTimeout(motivationalTimer);
        motivationalTimer = setTimeout(() => {
          motivationalMessage = "";
        }, 4000); // dura más tiempo
      }
      break;
    }
  }
}

function restartGame() {
  balls = [];
  score = 0;
  lives = 3;
  gameOver = false;
  motivationalMessage = "";
}
