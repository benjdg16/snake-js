/**
 * TODO: Window.requestAnimationFrame
 */

// Variables
const CANVAS_HEIGHT = 400;
const CANVAS_WIDTH = 400;
let SCORE = 0;

const SNAKE_COLOR = "black";
const SNAKE_SIZE = 20;
// const SNAKE_START_POS = [CANVAS_WIDTH / 2, CANVAS_WIDTH / 2];

const SNAKE_HEAD_COLOR = "#618833";
const SNAKE_BODY_COLOR = "#8bc34a";
const SNAKE_TAIL_COLOR = "#a2cf6e";

const APPLE_COLOR = "red";

// DOM Selectors
const el_body = document.body;
const el_canvas = document.getElementById("snake-canvas");
const el_score_value = document.querySelector(".score-value");
const canvasCtx = el_canvas.getContext("2d");

// Classes
class Snake {
	constructor(x, y, size) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.body = [
			{ x: this.x, y: this.y },
			{ x: this.x + 1, y: this.y + 1 },
		];
		this.rotateX = 0;
		this.rotateY = -1; // default going up at start
	}

	move() {
		let newRect;

		if (this.rotateX === 1) {
			newRect = {
				x: this.body[this.body.length - 1].x + this.size,
				y: this.body[this.body.length - 1].y,
			};
		} else if (this.rotateX === -1) {
			newRect = {
				x: this.body[this.body.length - 1].x - this.size,
				y: this.body[this.body.length - 1].y,
			};
		} else if (this.rotateY === 1) {
			newRect = {
				x: this.body[this.body.length - 1].x,
				y: this.body[this.body.length - 1].y + this.size,
			};
		} else if (this.rotateY === -1) {
			newRect = {
				x: this.body[this.body.length - 1].x,
				y: this.body[this.body.length - 1].y - this.size,
			};
		}

		// console.log(`newRect`);
		// console.log(newRect);

		this.body.shift();
		this.body.push(newRect);
	}
}

class Apple {
	constructor(snake) {
		this.snakeSize = snake.size;
		this.snakeTail = snake.body;
		this.isTouching;
		this.size = this.snakeSize;
		this.color = "red";

		while (true) {
			this.isTouching = false;
			this.x =
				Math.floor((Math.random() * CANVAS_WIDTH) / this.snakeSize) *
				this.snakeSize;
			this.y =
				Math.floor((Math.random() * CANVAS_HEIGHT) / this.snakeSize) *
				this.snakeSize;

			for (let i = 0; i < this.snakeTail.length; i++) {
				if (this.x == this.snakeTail[i].x && this.y == this.snakeTail[i].y) {
					this.isTouching = true;
				}
			}

			this.size = this.snakeSize;
			this.color = "red";

			if (!this.isTouching) {
				break;
			}
		}
	}
}

const snake = new Snake(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, SNAKE_SIZE);
let apple = new Apple(snake);
let gameInterval;

// Helpers
function setDefaults() {
	el_canvas.height = CANVAS_HEIGHT;
	el_canvas.width = CANVAS_WIDTH;
	el_score_value.textContent = SCORE;
}

function gameLoop() {
	gameInterval = setInterval(renderCanvas, 1000 / 24);
	// renderCanvas();
}

function renderCanvas() {
	updateStates();
	paintCanvas();
}

function updateStates() {
	snake.move();
	checkBoundaries();
	checkApple();
}

function paintCanvas() {
	createRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, SNAKE_COLOR);
	createRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	for (let i = 0; i < snake.body.length; i++) {
		// Add snake color here; easier than snake class; and this is the ui method anyways
		let snakePixelColor = SNAKE_BODY_COLOR;
		if (i === 0) {
			snakePixelColor = SNAKE_HEAD_COLOR;
		} else if (i === snake.body.length - 1) {
			snakePixelColor = SNAKE_TAIL_COLOR;
		}

		createRect(
			snake.body[i].x,
			snake.body[i].y,
			snake.size,
			snake.size,
			snakePixelColor
		);
	}
	createRect(apple.x, apple.y, apple.size, apple.size, apple.color);
}

function checkBoundaries() {
	let headTail = snake.body[snake.body.length - 1];

	if (headTail.x > CANVAS_WIDTH) {
		headTail.x = 0;
	} else if (headTail.x < 0) {
		headTail.x = CANVAS_WIDTH;
	} else if (headTail.y > CANVAS_HEIGHT) {
		headTail.y = 0;
	} else if (headTail.y < 0) {
		headTail.y = CANVAS_HEIGHT;
	}

	// console.log(snake.body);
	// console.log(headTail);
	snake.body.forEach((position, index) => {
		if (index !== snake.body.length - 1) {
			if (position.x === headTail.x && position.y === headTail.y) {
				console.log(`GAMEOVER`);
				clearInterval(gameInterval);
			}
		}
	});
}

function createRect(x, y, width, height, color) {
	if (canvasCtx) {
		canvasCtx.fillStyle = color;
		canvasCtx.fillRect(x, y, width, height);
	}
}

function checkApple() {
	if (
		snake.body[snake.body.length - 1].x === apple.x &&
		snake.body[snake.body.length - 1].y === apple.y
	) {
		SCORE = SCORE + 1;
		el_score_value.textContent = SCORE;
		snake.body.push({ x: apple.x, y: apple.y }); // push
		apple = new Apple(snake);
	}
}

// Event handlers
function handleKeyDown(e) {
	let headTail = snake.body[snake.body.length - 1];

	//not an efficient check
	if (
		headTail.x >= CANVAS_WIDTH ||
		headTail.x < 0 ||
		headTail.y >= CANVAS_HEIGHT ||
		headTail.y < 0
	) {
		return;
	}

	switch (e.key) {
		case "ArrowUp":
			if (snake.rotateY !== 1) {
				snake.rotateX = 0;
				snake.rotateY = -1; // down is bigger so up should be negative
			}
			break;
		case "ArrowRight":
			if (snake.rotateX !== -1) {
				snake.rotateX = 1;
				snake.rotateY = 0;
			}
			break;
		case "ArrowDown":
			if (snake.rotateY !== -1) {
				snake.rotateX = 0;
				snake.rotateY = 1;
			}
			break;
		case "ArrowLeft":
			if (snake.rotateX !== 1) {
				snake.rotateX = -1;
				snake.rotateY = 0;
			}
			break;
		default:
			console.log(`Invalid`);
	}
}

// Event bindings
// function eventBindings() {
window.addEventListener("keydown", handleKeyDown);
// }

// Initialize
function init() {
	setDefaults();
	// eventBindings();
	gameLoop();
}

document.addEventListener("DOMContentLoaded", function () {
	init();
});
