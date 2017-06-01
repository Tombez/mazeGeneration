"use strict";

/* User Variables */
var gridHeight = Math.min(window.innerWidth, window.innerHeight);
var r = 29; // Number of spaces from center and corner (excluding the center).
var startPosition = {x: 0, y: 0};
/* End User Variables */

Math.ROOT_THREE = Math.sqrt(3);
var cols = r * 2 + 1;
var hexagonSideLength = gridHeight / (cols * Math.ROOT_THREE);
var gridWidth = hexagonSideLength * (3/2 * cols + 1/2);
var canvas;
var ctx;
var spaces;
var drawX;
var drawY;
var animationTime = 5000; // in ms.
var nodes = ((r + 1) * r / 2 * 6 + 1);
var colorScaler = ~~(nodes / (1 + nodes / 200));

var directions = [{x: 1, y: -1}, {x: 0, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 0}];
var directionsLength = directions.length;
var corners = [{x: 2, y: Math.ROOT_THREE/2}, {x: 3/2, y: 0}, {x: 1/2, y: 0},
	{x: 0, y: Math.ROOT_THREE/2}, {x: 1/2, y: Math.ROOT_THREE}, {x: 3/2, y: Math.ROOT_THREE}];

function initCanvas() {
	canvas = document.getElementById("canvas");
	canvas.width = gridWidth;
	canvas.height = gridHeight;

	ctx = canvas.getContext("2d");
	ctx.fillStyle = "#CCC"; // Draw background.
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = "black";
	ctx.scale(hexagonSideLength, hexagonSideLength);
	ctx.lineWidth = 2 / hexagonSideLength;
}
function initSpaces() {
	spaces = {};
	for (var x = -r; x <= r; x++) {
		spaces[x] = {};
		var start = Math.max(-(r + x), -r);
		var end = Math.min(r - x, r);
		for (var y = start; y <= end; y++) {
			var space = {};
			spaces[x][y] = space;
			for (var n = 0; n <= directionsLength; n++) {
				space[n] = (n != directionsLength);
			}
		}	
	}
}
var stack = [];
var current = {x: startPosition.x, y: startPosition.y};
// Depth-first backtracker search algorithm from: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker.
function generate() {
	while(true) {
		spaces[current.x][current.y][directionsLength] = true;
		var neighbors = [];
		for (var n = 0; n < directionsLength; n++) {
			var x = current.x + directions[n].x;
			var y = current.y + directions[n].y;
			if (spaces[x] && spaces[x][y] && !spaces[x][y][directionsLength]) {
				neighbors.push(n);
			}
		}
		if (neighbors.length) {
			var next = neighbors[~~(Math.random() * neighbors.length)];
			spaces[current.x][current.y][next] = false;
			stack.push(next);
			current.x += directions[next].x;
			current.y += directions[next].y;
			spaces[current.x][current.y][(next + (directionsLength / 2)) % directionsLength] = false;
		} else { // backtrack:
			spaces[current.x][current.y].color = stack.length;
			drawCurrent();
			current.x -= directions[stack[stack.length - 1]].x;
			current.y -= directions[stack[stack.length - 1]].y;
			stack.pop();
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
	for (var n = 0; n < directionsLength; n++) {
		if (space[n]) {
			var nPrime = (n + 1) % corners.length;
			ctx.moveTo(corners[n].x, corners[n].y);
			ctx.lineTo(corners[nPrime].x, corners[nPrime].y);
		}
	}
}
function drawCurrent() {
	drawX = (current.x + r) * 3/2; // * hexagonSideLength
	var colTopOffset = (current.x + 2*r) * Math.ROOT_THREE/2;
	drawY = current.y * Math.ROOT_THREE + colTopOffset; // * hexagonSideLength
	var space = spaces[current.x][current.y];
	ctx.translate(drawX, drawY);
		fillSpace(current.x, current.y, space);
		ctx.beginPath();
		strokeSpace(current.x, current.y, space);
		ctx.stroke();
	ctx.translate(-drawX, -drawY);
}
function drawFinal() {
	drawAll(function(x, y, space) {
		fillSpace(x, y, space);
	});
	ctx.beginPath();
	drawAll(function(x, y, space) {
		strokeSpace(x, y, space);
	});
	ctx.stroke();
}
function drawAll(exec) {
	for (var x = -r; x <= r; x++) {
		drawX = (x + r) * 3/2; // * hexagonSideLength
		var colTopOffset = (x + 2*r) * Math.ROOT_THREE/2;
		var yStart = Math.max(-(r + x), -r);
		var yEnd = Math.min(r - x, r);
		for (var y = yStart; y <= yEnd; y++) {
			drawY = y * Math.ROOT_THREE + colTopOffset; // * hexagonSideLength
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
		setTimeout(loop, animationTime / nodes);
	} else {
		drawCurrent();
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