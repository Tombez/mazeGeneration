/* User Variables */
var mazeSize = window.innerWidth; // Dimensions of canvas in pixels.
var mazeSpaces = 15; // Number of spaces in the x and y directions.
/* End User Variables */

var spaceSize = ~~(mazeSize / mazeSpaces);
var canvas;
var ctx;
var spaces;

var stack = [];
var neighbors;
var next;
var x;
var y;
var n;
var current = {x: 0, y: 0};

// Basically rainbow tables:
var directions = [{x: 1, y: 0}, {x: 0, y: -1}, {x: -1, y: 0}, {x: 0, y: 1}]; // right, up, left, down.
var corners = [[{x: 1, y: 0}, {x: 1, y: 1}], [{x: 0, y: 0}, {x: 1, y: 0}], [{x: 0, y: 1}, {x: 0, y: 0}], [{x: 1, y: 1}, {x: 0, y: 1}]]; // [[NE, SE], [NW, NE], [SW, NW], [SE, SW]].

function initCanvas() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	canvas.width = spaceSize * mazeSpaces;
	canvas.height = spaceSize * mazeSpaces;
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
function renderMaze() {
	ctx.clearRect(0, 0, mazeSize, mazeSize);
	ctx.lineWidth = 2;
	spaces[current.x][current.y][4] = true; // a little hack.
	for (var y = 0; y < mazeSpaces; y++) {
		for (var x = 0; x < mazeSpaces; x++) {
			ctx.fillStyle = spaces[x][y][4] ? "indigo"/*#4B0082*/ : "grey"/*#808080*/;
			ctx.fillRect(x * spaceSize, y * spaceSize, spaceSize, spaceSize);
			
			ctx.beginPath(); // draw walls.
			ctx.strokeStyle = "white";
			for (var n = 0; n < directions.length; n++) {
				if (spaces[x][y][n]) {
					ctx.moveTo((x + corners[n][0].x) * spaceSize, (y + corners[n][0].y) * spaceSize);
					ctx.lineTo((x + corners[n][1].x) * spaceSize, (y + corners[n][1].y) * spaceSize);
				}
			}
			ctx.stroke();
		}
	}
	ctx.fillStyle = "red";
	ctx.fillRect((current.x + 0.25) * spaceSize, (current.y + 0.25) * spaceSize, spaceSize/2, spaceSize/2);

	ctx.beginPath(); // draw path:
	ctx.strokeStyle = "red";
	for (var n = 0; n + 1 < stack.length; n++) {
		ctx.moveTo((stack[n].x * spaceSize) + (spaceSize/2), (stack[n].y * spaceSize) + (spaceSize/2));
		ctx.lineTo((stack[n + 1].x * spaceSize) + (spaceSize/2), (stack[n + 1].y * spaceSize) + (spaceSize/2));
	}
	ctx.moveTo((stack[stack.length - 1].x * spaceSize) + (spaceSize/2), (stack[stack.length - 1].y * spaceSize) + (spaceSize/2)); // a little hack.
	ctx.lineTo((current.x * spaceSize) + (spaceSize/2), (current.y * spaceSize) + (spaceSize/2)); // a little hack.
	ctx.stroke();
}
function stepSearch() { // Depth-first backtracker search algorithm from: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker.
	spaces[current.x][current.y][4] = true;
	neighbors = [];
	for (n = 0; n < 4; n++) {
		x = current.x + directions[n].x;
		y = current.y + directions[n].y;
		if (spaces[x] && spaces[x][y] && !spaces[x][y][4]) {
			neighbors.push(n);
		}
	}
	if (neighbors.length) {
		next = neighbors[~~(Math.random() * neighbors.length)];
		spaces[current.x][current.y][next] = false;
		stack.push({x: current.x, y: current.y});
		current.x += directions[next].x;
		current.y += directions[next].y;
		spaces[current.x][current.y][(next + 2) % 4] = false;
	} else if (stack.length) {
		current = stack.pop();
	} else {
		return true; // we finished!
	}
}

// main:
initCanvas();
initSpaces();
function main() {
	if (!stepSearch()) {
		setTimeout(main, 250);
	}
	renderMaze();
}
main();