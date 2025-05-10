let video;
let poseNet;
let pose;
let playerX = 300;
let balls = [];
let score = 0;
let lives = 3;
let gameOver = false;

let motivationalMessage = "";
let motivationalDelay = 3000;
let heartImg;
let maxBalls = 1;

function preload() {
  heartImg = loadImage('img/corazon2.png');
}

function setup() {
  createCanvas(600, 400);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);

  noLoop();
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
  background(26, 26, 46);

  if (gameOver) {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("GAME OVER\nPuntaje: " + score, width / 2, height / 2);
    let restartBtn = document.getElementById("restartButton");
    if (restartBtn) restartBtn.style.display = "inline-block";
    noLoop();
    return;
  }

  // Ajustar cuántas pelotas pueden estar activas según el score
  maxBalls = 1 + Math.floor(score / 10);

  // Asegurar que haya suficiente cantidad de pelotas activas
  while (balls.length < maxBalls) {
    balls.push({ x: random(20, width - 20), y: 0 });
  }

  // Dibujar barra
  let barWidth = score >= 30 ? 35 : 50;
  fill(0, 255, 100);
  rect(playerX - barWidth / 2, height - 30, barWidth, 20);

  // Dibujar pelotas
  for (let i = balls.length - 1; i >= 0; i--) {
    let b = balls[i];
    fill(255, 50, 50);
    ellipse(b.x, b.y, 20);
    b.y += 4;

    if (b.y > height - 40 && abs(b.x - playerX) < barWidth / 2 + 10) {
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

  // Mostrar puntaje
  fill(255);
  textSize(24);
  textAlign(LEFT);
  text("Puntaje: " + score, 10, 30);

  // Mostrar corazones
  for (let i = 0; i < lives; i++) {
    image(heartImg, width - (i + 1) * 40 - 10, 10, 30, 30);
  }

  // Mensaje motivacional
  if (motivationalMessage) {
    textSize(28);
    textAlign(CENTER);
    fill(255, 215, 0);
    text(motivationalMessage, width / 2, height / 2 - 100);
  }
}

function updateMotivationalMessage() {
  if (score % 5 === 0) {
    if (score >= 100 && score % 15 !== 0) return;

    if (score >= 50) {
      motivationalMessage = "¡Imparable!";
    } else if (score >= 30) {
      motivationalMessage = "¡Increíble!";
    } else if (score >= 20) {
      motivationalMessage = "¡Asombroso!";
    } else if (score >= 10) {
      motivationalMessage = "¡Muy bien!";
    } else {
      motivationalMessage = "¡Sigue así!";
    }

    setTimeout(() => {
      motivationalMessage = "";
    }, motivationalDelay);
  }
}

function restartGame() {
  balls = [];
  score = 0;
  lives = 3;
  gameOver = false;
  motivationalMessage = "";
  let restartBtn = document.getElementById("restartButton");
  if (restartBtn) restartBtn.style.display = "none";
  loop();
}

function startGame() {
  let startBtn = document.getElementById("startButton");
  if (startBtn) startBtn.style.display = "none";
  loop();
}
