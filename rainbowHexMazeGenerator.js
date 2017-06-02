"use strict";

/* User Variables */
var gridHeight = Math.min(window.innerWidth, window.innerHeight);
var r = 29; // Number of spaces from center and corner (excluding the center).
var startPosition = {x: 0, y: 0};
var animationTime = 5000; // in ms.

var canvas;
var ctx;
var spaces;
Math.ROOT_THREE = Math.sqrt(3);
var cols = r * 2 + 1;
var hexagonSideLength = gridHeight / (cols * Math.ROOT_THREE);
var gridWidth = hexagonSideLength * (3/2 * cols + 1/2);
var nodes = ((r + 1) * r / 2 * 6 + 1);
var stepTime = animationTime / nodes;
var colorScaler = ~~(nodes / (1 + nodes / 200));

var directions = [{x: 1, y: -1}, {x: 0, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 0}];
var corners = [{x: 2, y: Math.ROOT_THREE/2}, {x: 3/2, y: 0}, {x: 1/2, y: 0},
	{x: 0, y: Math.ROOT_THREE/2}, {x: 1/2, y: Math.ROOT_THREE}, {x: 3/2, y: Math.ROOT_THREE}];

function initCanvas() {
	canvas = document.getElementById("canvas");
	canvas.width = gridWidth;
	canvas.height = gridHeight;

	ctx = canvas.getContext("2d");
	//ctx.fillStyle = "#CCC"; // Draw background.
	//ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = "black";
	ctx.scale(hexagonSideLength, hexagonSideLength);
	ctx.lineWidth = 2 / hexagonSideLength;
}
function initSpaces() {
	spaces = {};
	for (let x = -r; x <= r; x++) {
		var spaceX = spaces[x] = {};
		var start = Math.max(-(r + x), -r);
		var end = Math.min(r - x, r);
		for (let y = start; y <= end; y++) {
			var space = spaceX[y] = {};
			for (let n = 0; n < directions.length; n++) {
				space[n] = true;
			}
		}
	}
}
var stack = [];
var current = {x: startPosition.x, y: startPosition.y};
// Depth-first backtracker search algorithm from: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker.
function generate() {
	while(true) {
		var space = spaces[current.x][current.y];
		space.visited = true;
		var neighbors = [];
		for (let n = 0; n < directions.length; n++) {
			var direction = directions[n];
			var x = current.x + direction.x;
			var y = current.y + direction.y;
			var possibleX = spaces[x];
			if (possibleX) {
				var possible = possibleX[y];
				if (possible && !possible.visited) {
					neighbors.push(n);
				}
			}
		}
		if (neighbors.length) {
			var next = neighbors[~~(Math.random() * neighbors.length)];
			space[next] = false;
			stack.push(next);
			var directionNext = directions[next];
			current.x += directionNext.x;
			current.y += directionNext.y;
			spaces[current.x][current.y][(next + (directions.length / 2)) % directions.length] = false;
		} else { // backtrack:
			space.color = stack.length;
			drawCurrent();
			var directionPrevious = directions[stack.pop()];
			current.x -= directionPrevious.x;
			current.y -= directionPrevious.y;
			break; // breather after drawing.
		}
	}
}

function fillSpace(x, y, space) {
	ctx.beginPath();
	ctx.fillStyle = "hsl(" + ~~(((space.color % colorScaler) / colorScaler) * 360) + ", 100%, 50%)";
	ctx.moveTo(corners[0].x, corners[0].y);
	for (var n = 1; n < corners.length; n++) {
		ctx.lineTo(corners[n].x, corners[n].y);
	}
	ctx.closePath();
	ctx.fill();
}
function strokeSpace(x, y, space) {
	for (let n = 0; n < directions.length; n++) {
		if (space[n]) {
			var nPrime = (n + 1) % corners.length;
			ctx.moveTo(corners[n].x, corners[n].y);
			ctx.lineTo(corners[nPrime].x, corners[nPrime].y);
		}
	}
}
function drawCurrent() {
	var drawX = (current.x + r) * 3/2; // * hexagonSideLength
	var colTopOffset = (current.x + 2*r) * Math.ROOT_THREE/2;
	var drawY = current.y * Math.ROOT_THREE + colTopOffset; // * hexagonSideLength
	var space = spaces[current.x][current.y];
	ctx.translate(drawX, drawY);
		fillSpace(current.x, current.y, space);
		ctx.beginPath();
			strokeSpace(current.x, current.y, space);
		ctx.stroke();
	ctx.translate(-drawX, -drawY);
}
function drawFinal() {
	drawAll(fillSpace);
	ctx.beginPath();
		drawAll(strokeSpace);
	ctx.stroke();
}
function drawAll(exec) {
	for (let x = -r; x <= r; x++) {
		var drawX = (x + r) * 3/2; // * hexagonSideLength
		var colTopOffset = (x + 2*r) * Math.ROOT_THREE/2;
		var yStart = Math.max(-(r + x), -r);
		var yEnd = Math.min(r - x, r);
		for (let y = yStart; y <= yEnd; y++) {
			var drawY = y * Math.ROOT_THREE + colTopOffset; // * hexagonSideLength
			ctx.translate(drawX, drawY);
			exec(x, y, spaces[x][y]);
			ctx.translate(-drawX, -drawY);
		}
	}
}

// Main:
initCanvas();
initSpaces();
function loop() {
	if (stack.length) {
		generate();
		setTimeout(loop, stepTime);
	} else {
		drawFinal();
	}
}
generate();
loop();

/* 
 * Useful Hexagon/Grid Formulas:
 *
 * hexagon_width = 2 * hexagon_sidelength;
 * hexagon_height = Math.sqrt(3) * hexagon_sidelength;
 *
 * hexagongrid_columns = (hexagongrid_sidenodes * 2) - 1;
 * hexagongrid_height = Math.sqrt(3) * hexagon_sidelength * hexagongrid_columns;
 * hexagongrid_width = hexagon_sidelength * (3/2 * hexagongrid_columns + 1/2);
 */