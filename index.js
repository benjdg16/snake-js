// Variables
// Environment
const CANVAS_HEIGHT = 400;
const CANVAS_WIDTH = 400;
const FPS = 60;
const DEFAULT_LEVEL = 1;
const SS_HI_SCORE_KEY = "SNAKE-JS_SCORE";
const NEW_HI_SCORE_CLASS = "new-hi-score"; // Note: Added in CSS

let SCORE = 0;
let HI_SCORE = 0;
let GAME_OVER = false;
let FPS_INTERVAL, START_INTERVAL;

// Class variables
const SNAKE_SIZE = 20;
const SNAKE_HEAD_COLOR = "#618833";
const SNAKE_BODY_COLOR = "#8bc34a";
const SNAKE_TAIL_COLOR = "#a2cf6e";
const SNAKE_MOVES = {
	x: {
		RETAIN: 0,
		RIGHT: 1,
		LEFT: -1,
	},
	y: {
		RETAIN: 0,
		UP: -1,
		DOWN: 1, // Down is positive since canvas is increasing from top-left to bottom-right
	},
};

const APPLE_COLOR = "#C03131";

let snake;
let apple;

// DOM Selectors
const el_body = document.body;
const el_canvas = document.getElementById("snake-canvas");
const el_score_container = document.querySelector(".score-container");
const el_score_value = document.querySelector(".score-value");
const el_hi_score_value = document.querySelector(".hi-score-value");
const el_btn_start = document.querySelector(".btn-start");
const canvasCtx = el_canvas.getContext("2d");

// Classes
class Snake {
	constructor(x, y, size) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.body = [
			{ x: this.x, y: this.y },
			{ x: this.x, y: this.y }, // Default body has 2 pixels to simulate a head and a tail
		];
		this.rotateX = SNAKE_MOVES.x.RETAIN;
		this.rotateY = SNAKE_MOVES.y.UP; // Note: Default going up;
	}

	/**
	 * Note: Negative in y-axis means going up since canvas grows at the bottom-right
	 * Note: Prevent user from going back on the other direction (L-R) or (U-D)
	 */
	move() {
		let newRect;

		if (this.rotateX === SNAKE_MOVES.x.RIGHT) {
			newRect = {
				x: this.body[this.body.length - 1].x + this.size,
				y: this.body[this.body.length - 1].y,
			};
		} else if (this.rotateX === SNAKE_MOVES.x.LEFT) {
			newRect = {
				x: this.body[this.body.length - 1].x - this.size,
				y: this.body[this.body.length - 1].y,
			};
		} else if (this.rotateY === SNAKE_MOVES.y.DOWN) {
			newRect = {
				x: this.body[this.body.length - 1].x,
				y: this.body[this.body.length - 1].y + this.size,
			};
		} else if (this.rotateY === SNAKE_MOVES.y.UP) {
			newRect = {
				x: this.body[this.body.length - 1].x,
				y: this.body[this.body.length - 1].y - this.size,
			};
		}

		this.body.shift(); // Remove tail on next paint
		this.body.push(newRect); // Push new head on next paint
	}
}

class Apple {
	constructor(snake) {
		this.snakeSize = snake.size;
		this.snakeBody = snake.body;
		this.isTouching = false;
		this.size = this.snakeSize;
		this.color = APPLE_COLOR;

		while (true) {
			this.x =
				Math.floor((Math.random() * CANVAS_WIDTH) / this.snakeSize) *
				this.snakeSize;
			this.y =
				Math.floor((Math.random() * CANVAS_HEIGHT) / this.snakeSize) *
				this.snakeSize;

			// This check prevents spawning the apple in the same position as the snake's body
			for (let i = 0; i < this.snakeBody.length; i++) {
				if (this.x == this.snakeBody[i].x && this.y == this.snakeBody[i].y) {
					this.isTouching = true;
				}
			}

			if (!this.isTouching) {
				// Apple position is valid, get out of loop
				break;
			}
		}
	}
}

// Helpers
// TODO: Reset also FPS_INTERVAL if levels are incorporated
function setDefaults() {
	const sessionHiScore = sessionStorage.getItem(SS_HI_SCORE_KEY);
	HI_SCORE = sessionHiScore ? Number(sessionHiScore) : 0;
	SCORE = 0;

	el_canvas.height = CANVAS_HEIGHT;
	el_canvas.width = CANVAS_WIDTH;
	el_score_container.classList.remove(NEW_HI_SCORE_CLASS);
	el_score_value.textContent = SCORE;
	el_hi_score_value.textContent = HI_SCORE;

	snake = new Snake(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, SNAKE_SIZE);
	apple = new Apple(snake);

	GAME_OVER = false;
}

// TODO: Incorporate levels
function getFpsInterval(level = DEFAULT_LEVEL) {
	return 1000 / 24;
}

function triggerGameLoop() {
	FPS_INTERVAL = getFpsInterval();
	START_INTERVAL = Date.now();

	// window.requestAnimationFrame(renderCanvas);
	renderCanvas();
}

function renderCanvas() {
	if (!GAME_OVER) {
		window.requestAnimationFrame(renderCanvas);
	}

	const now = Date.now();
	const elapsed = now - START_INTERVAL;

	if (elapsed > FPS_INTERVAL) {
		// TODO: Recompute interval here if level is incorporated
		START_INTERVAL = now - (elapsed % FPS_INTERVAL);

		updateStates();
		paintCanvas();
	}
}

function updateStates() {
	snake.move();
	checkBoundaries();
	checkApple();
}

function paintCanvas() {
	createRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "black");

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

function createRect(x, y, width, height, color) {
	if (canvasCtx) {
		canvasCtx.fillStyle = color;
		canvasCtx.fillRect(x, y, width, height);
	}
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

	snake.body.forEach((position, index) => {
		if (index !== snake.body.length - 1) {
			if (position.x === headTail.x && position.y === headTail.y) {
				GAME_OVER = true;
			}
		}
	});
}

function checkApple() {
	if (
		snake.body[snake.body.length - 1].x === apple.x &&
		snake.body[snake.body.length - 1].y === apple.y
	) {
		SCORE = SCORE + 1;

		if (SCORE > HI_SCORE) {
			sessionStorage.setItem(SS_HI_SCORE_KEY, SCORE);
			HI_SCORE = SCORE;
			el_score_container.classList.add(NEW_HI_SCORE_CLASS);
		}

		el_score_value.textContent = SCORE;
		el_hi_score_value.textContent = HI_SCORE;
		snake.body.push({ x: apple.x, y: apple.y }); // Push current position of apple to snake body to "feed" it
		apple = new Apple(snake);
	}
}

// Event handlers
function handleKeyDown(e) {
	const snakeHead = snake.body[snake.body.length - 1];

	// Note: Not an efficient check but prevents a bug that lets the snake
	// continue beyond boundaries.
	// Note: Prevent an event when beyond canvas boundaries
	if (
		snakeHead.x >= CANVAS_WIDTH ||
		snakeHead.x < 0 ||
		snakeHead.y >= CANVAS_HEIGHT ||
		snakeHead.y < 0
	) {
		return;
	}

	const DIRECTIONS = {
		UP: "UP",
		RIGHT: "RIGHT",
		DOWN: "DOWN",
		LEFT: "LEFT",
	};

	let translatedKey;

	if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
		translatedKey = DIRECTIONS.UP;
	} else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
		translatedKey = DIRECTIONS.RIGHT;
	} else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
		translatedKey = DIRECTIONS.DOWN;
	} else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
		translatedKey = DIRECTIONS.LEFT;
	}

	switch (translatedKey) {
		case DIRECTIONS.UP:
			if (snake.rotateY !== SNAKE_MOVES.y.DOWN) {
				snake.rotateX = SNAKE_MOVES.x.RETAIN;
				snake.rotateY = SNAKE_MOVES.y.UP;
			}
			break;
		case DIRECTIONS.RIGHT:
			if (snake.rotateX !== SNAKE_MOVES.x.LEFT) {
				snake.rotateX = SNAKE_MOVES.x.RIGHT;
				snake.rotateY = SNAKE_MOVES.y.RETAIN;
			}
			break;
		case DIRECTIONS.DOWN:
			if (snake.rotateY !== SNAKE_MOVES.y.UP) {
				snake.rotateX = SNAKE_MOVES.x.RETAIN;
				snake.rotateY = SNAKE_MOVES.y.DOWN;
			}
			break;
		case DIRECTIONS.LEFT:
			if (snake.rotateX !== SNAKE_MOVES.x.RIGHT) {
				snake.rotateX = SNAKE_MOVES.x.LEFT;
				snake.rotateY = SNAKE_MOVES.y.RETAIN;
			}
			break;
		default:
			break;
	}
}

function handleBtnStart() {
	if (GAME_OVER) {
		setDefaults();
	}

	triggerGameLoop();
}

// Event bindings
function eventBindings() {
	window.addEventListener("keydown", handleKeyDown);
	el_btn_start.addEventListener("click", handleBtnStart);
}

// Initialize
function init() {
	setDefaults();
	eventBindings();
}

document.addEventListener("DOMContentLoaded", function () {
	init();
});
