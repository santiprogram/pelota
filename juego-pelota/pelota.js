let video;
let poseNet;
let pose;
let playerX = 300;
let balls = [];
let score = 0;
let lives = 3;
let gameOver = false;

const ballSpeed = 4;
let motivationalMessage = "";
let heartsImg;
let backgroundStars = [];

function preload() {
  heartsImg = loadImage('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Iconic_image_of_a_heart.svg/120px-Iconic_image_of_a_heart.svg.png');
}

function setup() {
  createCanvas(600, 400);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);

  // Generar fondo de estrellas
  for (let i = 0; i < 100; i++) {
    backgroundStars.push({ x: random(width), y: random(height), size: random(1, 3), speed: random(0.2, 1) });
  }

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
  drawBackground();

  if (gameOver) {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("GAME OVER\nPuntaje: " + score, width / 2, height / 2);
    document.getElementById("restartButton").style.display = "inline-block";
    return;
  }

  let baseWidth = 50;
  let playerColor = color(0, 255, 0);

  if (score >= 50) {
    baseWidth = 25;
    playerColor = color(255, 0, 255);
  } else if (score >= 30) {
    baseWidth = 35;
    playerColor = color(0, 150, 255);
  }

  fill(playerColor);
  rect(playerX - baseWidth / 2, height - 30, baseWidth, 20);

  for (let i = balls.length - 1; i >= 0; i--) {
    let b = balls[i];
    fill(b.color);
    ellipse(b.x, b.y, 20);
    b.y += ballSpeed;

    if (b.y > height - 40 && abs(b.x - playerX) < baseWidth / 2 + 10) {
      // Explosión visual
      createExplosion(b.x, b.y);
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

  drawHUD();
  drawExplosions();
}

function spawnBall() {
  if (!gameOver) {
    let numBalls = 1 + floor(score / 10);
    for (let i = 0; i < numBalls; i++) {
      balls.push({
        x: random(20, width - 20),
        y: 0,
        color: color(random(255), random(255), random(255))
      });
    }
  }
}

let explosions = [];

function createExplosion(x, y) {
  for (let i = 0; i < 20; i++) {
    explosions.push({
      x: x,
      y: y,
      vx: random(-2, 2),
      vy: random(-2, 2),
      life: 30
    });
  }
}

function drawExplosions() {
  noStroke();
  for (let i = explosions.length - 1; i >= 0; i--) {
    let p = explosions[i];
    fill(255, 215, 0, p.life * 8);
    ellipse(p.x, p.y, 5);
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) {
      explosions.splice(i, 1);
    }
  }
}

function updateMotivationalMessage() {
  let interval = 5;
  if (score >= 200) {
    interval = 20;
  } else if (score >= 100) {
    interval = 10;
  }

  if (score % interval === 0) {
    let messages = [
      "¡Sigue así!", "¡Muy bien!", "¡Asombroso!", "¡Legendario!",
      "¡Increíble!", "¡Imparable!", "¡Eres una máquina!", "¡Alucinante!",
      "¡Brillante!", "¡Fantástico!", "¡Bestial!"
    ];
    motivationalMessage = random(messages);

    setTimeout(() => {
      motivationalMessage = "";
    }, 6000); // 6 segundos
  }
}

function drawHUD() {
  fill(255);
  textSize(16);
  textAlign(LEFT);
  text("Puntaje: " + score, 10, 20);

  // Dibujar corazones
  for (let i = 0; i < lives; i++) {
    image(heartsImg, 10 + i * 30, 30, 20, 20);
  }

  if (motivationalMessage) {
    push();
    textSize(28);
    textAlign(CENTER);
    fill(255, 215, 0);
    text(motivationalMessage, width / 2, height / 2 - 100);
    pop();
  }
}

function drawBackground() {
  background(20);
  noStroke();
  fill(255);
  for (let star of backgroundStars) {
    circle(star.x, star.y, star.size);
    star.y += star.speed;
    if (star.y > height) {
      star.y = 0;
      star.x = random(width);
    }
  }
}

function restartGame() {
  balls = [];
  score = 0;
  lives = 3;
  gameOver = false;
  motivationalMessage = "";
  explosions = [];
  document.getElementById("restartButton").style.display = "none";
}
