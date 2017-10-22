"use strict";

/* User Variables */
let gridHeight = Math.min(window.innerWidth, window.innerHeight);
const r = 29; // Number of spaces from center and corner (excluding the center).
let startPosition = {x: 0, y: 0};
const animationTime = 5; // in seconds.

let canvas;
let ctx;
let spaces;
const rootThree = Math.sqrt(3);
const cols = r * 2 + 1;
const hexagonSideLength = gridHeight / (cols * rootThree);
const gridWidth = hexagonSideLength * (3/2 * cols + 1/2);
const nodes = ((r + 1) * r / 2 * 6 + 1);
const stepTime = animationTime / nodes;
const colorScaler = Math.floor(nodes / (1 + nodes / 360));
const fps = 60;
const nodesPerFrame = nodes / (animationTime * fps);
let nodesToDraw = 0;
let previousTime = 0;
let stack = [];
let current = {x: startPosition.x, y: startPosition.y};

const directions = [{x: 1, y: -1}, {x: 0, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 0}];
const corners = [{x: 2, y: rootThree/2}, {x: 3/2, y: 0}, {x: 1/2, y: 0},
	{x: 0, y: rootThree/2}, {x: 1/2, y: rootThree}, {x: 3/2, y: rootThree}];

function initCanvas() {
	canvas = document.getElementById("canvas");
	canvas.width = gridWidth;
	canvas.height = gridHeight;

	ctx = canvas.getContext("2d");
	ctx.scale(hexagonSideLength, hexagonSideLength);
	ctx.lineWidth = 2 / hexagonSideLength;
}
function initSpaces() {
	spaces = {};
	for (let x = -r; x <= r; x++) {
		const spaceX = spaces[x] = {};
		const start = Math.max(-(r + x), -r);
		const end = Math.min(r - x, r);
		for (let y = start; y <= end; y++) {
			let space = spaceX[y] = {};
			for (let n = 0; n < directions.length; n++) {
				space[n] = true;
			}
		}
	}
}
// Depth-first backtracker search algorithm from: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker.
function step() {
	while(true) {
		let space = spaces[current.x][current.y];
		space.visited = stack.length % colorScaler + 1;
		let neighbors = [];
		for (let n = 0; n < directions.length; n++) {
			const direction = directions[n];
			const possibleX = spaces[current.x + direction.x];
			if (possibleX) {
				const possible = possibleX[current.y + direction.y];
				if (possible && !possible.visited) {
					neighbors.push(n);
				}
			}
		}
		if (neighbors.length) {
			const next = neighbors[Math.floor(Math.random() * neighbors.length)];
			space[next] = false;
			stack.push(next);
			const directionNext = directions[next];
			current.x += directionNext.x;
			current.y += directionNext.y;
			spaces[current.x][current.y][(next + (directions.length / 2)) % directions.length] = false;
		} else { // backtrack:
			drawCurrent();
			const directionPrevious = directions[stack.pop()];
			current.x -= directionPrevious.x;
			current.y -= directionPrevious.y;
			break; // breather after drawing.
		}
	}
}

function fillSpace(_space) {
	ctx.beginPath();
	ctx.fillStyle = "hsl(" + Math.floor(((_space.visited - 1) / colorScaler) * 360) + ", 100%, 50%)";
	ctx.moveTo(corners[0].x, corners[0].y);
	for (var n = 1; n < corners.length; n++) {
		ctx.lineTo(corners[n].x, corners[n].y);
	}
	ctx.closePath();
	ctx.fill();
}
function strokeSpace(_space) {
	for (let n = 0; n < directions.length; n++) {
		if (_space[n]) {
			const nPrime = (n + 1) % corners.length;
			ctx.moveTo(corners[n].x, corners[n].y);
			ctx.lineTo(corners[nPrime].x, corners[nPrime].y);
		}
	}
}
function drawCurrent() {
	const drawX = (current.x + r) * 3/2; // * hexagonSideLength
	const colTopOffset = (current.x + 2*r) * rootThree/2;
	const drawY = current.y * rootThree + colTopOffset; // * hexagonSideLength
	const space = spaces[current.x][current.y];
	ctx.translate(drawX, drawY);
		fillSpace(space);
		ctx.beginPath();
			strokeSpace(space);
		ctx.stroke();
	ctx.translate(-drawX, -drawY);
}
function drawFinal() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawAll(fillSpace);
	ctx.beginPath();
	drawAll(strokeSpace);
	ctx.stroke();
}
function drawAll(_exec) {
	for (let x = -r; x <= r; x++) {
		const drawX = (x + r) * 3/2; // * hexagonSideLength
		const colTopOffset = (x + 2*r) * rootThree/2;
		const yStart = Math.max(-(r + x), -r);
		const yEnd = Math.min(r - x, r);
		for (let y = yStart; y <= yEnd; y++) {
			const drawY = y * rootThree + colTopOffset; // * hexagonSideLength
			ctx.translate(drawX, drawY);
				_exec(spaces[x][y]);
			ctx.translate(-drawX, -drawY);
		}
	}
}

// Main:
initCanvas();
initSpaces();
step();
function loop(_time) {
	if (stack.length) {
		nodesToDraw += (_time - previousTime) / (1000 / fps) * nodesPerFrame;
		previousTime = _time;
		for(; nodesToDraw >= 1 && stack.length; nodesToDraw--) {
			step();
		}
		requestAnimationFrame(loop);
	} else {
		drawFinal();
	}
}
requestAnimationFrame(loop);