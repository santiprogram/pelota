const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let model, gameRunning = false;
let score = 0, lives = 3, level = 1;
let balls = [];
let nose = { x: canvas.width / 2, y: canvas.height / 2 };

// 🎥 Inicializar cámara
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: "user" },
      audio: false
    });
    video.srcObject = stream;
    await new Promise((res) => (video.onloadedmetadata = res));
    console.log("✅ Cámara iniciada");
    return true;
  } catch (err) {
    alert("Error al acceder a la cámara: " + err.message);
    return false;
  }
}

// 🧠 Cargar PoseNet
async function loadPoseNet() {
  model = await posenet.load();
  console.log("✅ PoseNet cargado");
  detectPose();
}

// 🔍 Detectar la nariz
async function detectPose() {
  if (!gameRunning) return requestAnimationFrame(detectPose);

  const pose = await model.estimateSinglePose(video, {
    flipHorizontal: true
  });

  if (pose && pose.keypoints) {
    const nosePoint = pose.keypoints.find(k => k.part === "nose");
    if (nosePoint && nosePoint.score > 0.4) {
      // Convertir coordenadas del video al canvas
      const scaleX = canvas.width / video.videoWidth;
      const scaleY = canvas.height / video.videoHeight;
      nose.x = nosePoint.position.x * scaleX;
      nose.y = nosePoint.position.y * scaleY;
    }
  }

  requestAnimationFrame(detectPose);
}

// ⚽ Pelota
class Ball {
  constructor(x, y, r, c, speed) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.c = c;
    this.speed = speed;
  }
  update() {
    this.y += this.speed;
    if (this.y > canvas.height + this.r) {
      this.reset();
      lives--;
      if (lives <= 0) endGame();
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.c;
    ctx.fill();
    ctx.closePath();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -10;
  }
}

// 🎮 Crear pelotas
function createBalls(n) {
  balls = [];
  for (let i = 0; i < n; i++) {
    balls.push(
      new Ball(
        Math.random() * canvas.width,
        Math.random() * -canvas.height,
        15 + Math.random() * 10,
        `hsl(${Math.random() * 360}, 70%, 60%)`,
        2 + Math.random() * 3
      )
    );
  }
}

// 🧍‍♂️ Dibujar jugador (nariz)
function drawPlayer() {
  ctx.beginPath();
  ctx.arc(nose.x, nose.y, 25, 0, Math.PI * 2);
  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.closePath();
}

// 💥 Colisiones
function checkCollisions() {
  for (const b of balls) {
    const dx = b.x - nose.x;
    const dy = b.y - nose.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < b.r + 25) {
      score++;
      b.reset();
      if (score % 10 === 0) {
        level++;
        createBalls(level + 4);
      }
    }
  }
}

// 🧾 HUD
function drawHUD() {
  scoreEl.textContent = `Puntos: ${score}`;
  livesEl.textContent = `Vidas: ${lives}`;
  levelEl.textContent = `Nivel: ${level}`;
}

// 🔁 Actualizar juego
function updateGame() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const b of balls) {
    b.update();
    b.draw();
  }

  drawPlayer();
  checkCollisions();
  drawHUD();

  requestAnimationFrame(updateGame);
}

// ▶️ Iniciar juego
async function startGame() {
  startBtn.style.display = "none";
  gameRunning = true;
  score = 0; lives = 3; level = 1;
  createBalls(5);
  await initCamera();
  await loadPoseNet();
  updateGame();
}

// ⏹️ Fin de juego
function endGame() {
  gameRunning = false;
  alert(`Juego terminado. Puntos: ${score}`);
  startBtn.style.display = "block";
}

startBtn.addEventListener("click", startGame);
