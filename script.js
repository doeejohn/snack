const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");

const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");

const box = 40;
let snake, direction, food, score, highScore, speed, game, gameOver;

let swipeStart = null;

// Initialisation du jeu
function initGame() {
    snake = [{ x: 200, y: 200 }];
    direction = "RIGHT";
    food = spawnFood();
    score = 0;
    speed = 100;
    gameOver = false;
    highScore = localStorage.getItem("snakeHighScore") || 0;
    scoreDisplay.textContent = "Score : " + score;
    highScoreDisplay.textContent = "High Score : " + highScore;
    if (game) clearInterval(game);
    game = setInterval(draw, speed);
}

function spawnFood() {
    let x, y;
    do {
        x = Math.floor(Math.random() * (canvas.width / box)) * box;
        y = Math.floor(Math.random() * (canvas.height / box)) * box;
    } while (snake.some(seg => seg.x === x && seg.y === y));
    return { x, y };
}

// Contrôles clavier
document.addEventListener("keydown", event => {
    const key = event.key;
    if (key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    if (key === " " && gameOver) initGame(); // relancer avec espace
});

// Swipe mobile
canvas.addEventListener("touchstart", e => {
    swipeStart = e.touches[0];
});
canvas.addEventListener("touchend", e => {
    if (!swipeStart) return;
    const swipeEnd = e.changedTouches[0];
    const dx = swipeEnd.clientX - swipeStart.clientX;
    const dy = swipeEnd.clientY - swipeStart.clientY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction !== "LEFT") direction = "RIGHT";
        else if (dx < 0 && direction !== "RIGHT") direction = "LEFT";
    } else {
        if (dy > 0 && direction !== "UP") direction = "DOWN";
        else if (dy < 0 && direction !== "DOWN") direction = "UP";
    }
    swipeStart = null;
});

// Dessin du jeu
function draw() {
    // fond
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // serpent
    snake.forEach((seg, i) => {
        ctx.fillStyle = `hsl(${(score*20 + i*30) % 360}, 100%, 50%)`;
        ctx.fillRect(seg.x, seg.y, box, box);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(seg.x, seg.y, box, box);
    });

    // nourriture
    ctx.fillStyle = `hsl(${(score*50) % 360}, 100%, 50%)`;
    ctx.fillRect(food.x, food.y, box, box);

    // mouvement
    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= box;
    if (direction === "UP") headY -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "DOWN") headY += box;

    // **Map infinie – wrap-around**
    if (headX >= canvas.width) headX = 0;
    if (headX < 0) headX = canvas.width - box;
    if (headY >= canvas.height) headY = 0;
    if (headY < 0) headY = canvas.height - box;

    // manger
    if (headX === food.x && headY === food.y) {
        score++;
        eatSound.currentTime = 0;
        eatSound.play();
        scoreDisplay.textContent = "Score : " + score;
        food = spawnFood();
        if (score % 5 === 0 && speed > 30) {
            clearInterval(game);
            speed -= 10;
            game = setInterval(draw, speed);
        }
    } else {
        snake.pop();
    }

    const newHead = { x: headX, y: headY };

    // collision avec soi-même
    if (collision(newHead, snake)) {
        gameOver = true;
        clearInterval(game);
        gameOverSound.play();
        setTimeout(initGame, 1000); // relance automatique
    }

    snake.unshift(newHead);
    highScoreDisplay.textContent = "High Score : " + Math.max(highScore, score);
    if (score > highScore) localStorage.setItem("snakeHighScore", score);
}

function collision(head, arr) {
    return arr.some(seg => head.x === seg.x && head.y === seg.y);
}

// Démarrage du jeu
initGame();
