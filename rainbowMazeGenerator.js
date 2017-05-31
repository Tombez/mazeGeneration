"use strict";

/* User Variables */
var mazeSize = Math.min(window.innerWidth, window.innerHeight); // Canvas dimensions might be smaller!
var mazeSpaces = 80; // Number of spaces in the x and y directions.
var startPosition = {x: 0, y: 0};
/* End User Variables */

var spaceSize;
var canvas;
var ctx;
var spaces;
var options;

var directions = [{x: 1, y: 0}, {x: 0, y: -1}, {x: -1, y: 0}, {x: 0, y: 1}]; // right, up, left, down.
var corners = [{x: 1, y: 1}, {x: 1, y: 0}, {x: 0, y: 0}, {x: 0, y: 1}]; // SE, NE, NW, SW.

function initOptions() {
	options = {};
	var inputs = document.getElementsByTagName("input");
	for (var input of inputs) {
		options[input.id + "_" + input.type + "_listener"] = function(event) {
			options[event.target.id] = event.target.value;
		};
		input.addEventListener("change", options[input.id + "_" + input.type + "_listener"]);
		options[input.id + "_" + input.type + "_listener"]({target: input});
	}
}

function initCanvas() {
	canvas = document.getElementById("canvas");
	
	spaceSize = Math.max(~~(mazeSize / mazeSpaces), 2);
	mazeSize = mazeSpaces * spaceSize + 1;
	
	canvas.width = mazeSize;
	canvas.height = mazeSize;

	ctx = canvas.getContext("2d");
	ctx.fillStyle = "#CCC"; // Draw background.
	ctx.fillRect(0, 0, mazeSize, mazeSize);
	ctx.lineWidth = 1;
	ctx.strokeStyle = "black";
}

function initSpaces() {
	spaces = new Array(mazeSpaces);
	for (var n = 0; n < mazeSpaces; n++) {
		spaces[n] = new Array(mazeSpaces);
		for (var i = 0; i < mazeSpaces; i++) {
			spaces[n][i] = [true, true, true, true, false]; // Right, up, left, down (walls), visited.
		}	
	}
}

var stack = [];
var neighbors;
var next;
var x;
var y;
var n;
var current = {x: startPosition.x, y: startPosition.y};
function step() { // Depth-first backtracker search algorithm from: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker.
	while(true) {
		spaces[current.x][current.y][directions.length] = true;
		neighbors = [];
		for (n = 0; n < directions.length; n++) {
			x = current.x + directions[n].x;
			y = current.y + directions[n].y;
			if (spaces[x] && spaces[x][y] && !spaces[x][y][directions.length]) {
				neighbors.push(n);
			}
		}
		if (neighbors.length) {
			next = neighbors[~~(Math.random() * neighbors.length)];
			spaces[current.x][current.y][next] = false;
			stack.push(next);
			current.x += directions[next].x;
			current.y += directions[next].y;
			spaces[current.x][current.y][(next + (directions.length / 2)) % directions.length] = false;
		} else { // backtrack:
			spaces[current.x][current.y].color = stack.length;
			drawProgress();
			current.x -= directions[stack[stack.length - 1]].x;
			current.y -= directions[stack[stack.length - 1]].y;
			stack.pop();
			break; // breather after a draw.
		}
	}
}

function drawProgress() {
	ctx.beginPath(); // Draw walls.
	drawTile(current.x, current.y);
	ctx.stroke();
}
function drawFinal() {
	ctx.beginPath();
	for (var y = 0; y < mazeSpaces; y++) {
		for (var x = 0; x < mazeSpaces; x++) {
			drawTile(x, y);
		}
	}
	ctx.stroke();
}
function drawTile(x, y) {
	ctx.fillStyle = "hsl(" + (spaces[x][y].color % 361) + ", " + options.saturation + "%, " + options.lightness + "%)";
	ctx.fillRect(x * spaceSize, y * spaceSize, spaceSize, spaceSize);
	for (var n = 0; n < directions.length; n++) {
		if (spaces[x][y][n]) {
			ctx.moveTo((x + corners[n].x) * spaceSize + 0.5, (y + corners[n].y) * spaceSize + 0.5);
			ctx.lineTo((x + corners[(n + 1) % corners.length].x) * spaceSize + 0.5,
				(y + corners[(n + 1) % corners.length].y) * spaceSize + 0.5);
		}
	}
}

// Main:
initOptions();
initCanvas();
initSpaces();
function loop() {
	if(stack.length) {
		step();
		setTimeout(loop, 0);
	} else {
		drawProgress();
		drawFinal();
	}
}
step();
loop();