/* User Variables */
var mazeSize = 1000; // Dimensions of canvas in pixels.
var mazeSpaces = 100; // Number of spaces in the x and y directions.
var startPosition = {x: 0, y: 0};
var finishPosition = {x: mazeSpaces - 1, y: mazeSpaces - 1};
/* End User Variables */

var spaceSize = ~~(mazeSize / mazeSpaces);
var canvas;
var ctx;
var spaces;
var solutionPath;
var letterWidth;
var letterHeight;

// Basically rainbow tables:
var directions = [{x: 1, y: 0}, {x: 0, y: -1}, {x: -1, y: 0}, {x: 0, y: 1}]; // right, up, left, down.
var corners = [[{x: 1, y: 0}, {x: 1, y: 1}], [{x: 0, y: 0}, {x: 1, y: 0}], [{x: 0, y: 1}, {x: 0, y: 0}], [{x: 1, y: 1}, {x: 0, y: 1}]]; // [[NE, SE], [NW, NE], [SW, NW], [SE, SW]].

function initCanvas() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	canvas.width = spaceSize * mazeSpaces;
	canvas.height = spaceSize * mazeSpaces; // + ctx.lineWidth;
	
	//ctx.translate(1, 1); // ~~(ctx.lineWidth / 2).
	
	canvas.style.width = Math.min(window.innerWidth, window.innerHeight)-4 + "px";
	canvas.style.height = canvas.style.width;
	
	letterWidth = ctx.measureText("S").width;
	letterHeight = spaceSize - (2 / 15 * 2 * spaceSize);
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
function generate() { // Depth-first backtracker search algorithm from: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker.
	// init generation:
	var stack = [];
	var neighbors;
	var next;
	var x;
	var y;
	var n;
	
	var current = {x: startPosition.x, y: startPosition.y};
	
	while(true) {
		/*if (current.x == finishPosition.x && current.y == finishPosition.y) {
			for(var n = 0; n < stack.length; n++) { // Set solution.
				solutionPath[n] = {x: stack[n].x, y: stack[n].y};
			}
		}*/
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
			break; // we finished!
		}
	}
}
function draw() {
	ctx.fillStyle = "white"; // Draw background.
	ctx.fillRect(0, 0, mazeSize, mazeSize);
	
	ctx.beginPath(); // Draw walls.
	ctx.lineWidth = 2;
	ctx.strokeStyle = "black";
	for (var y = 0; y < mazeSpaces; y++) {
		for (var x = 0; x < mazeSpaces; x++) {
			for (var n = 0; n < directions.length; n++) {
				if (spaces[x][y][n]) {
					ctx.moveTo((x + corners[n][0].x) * spaceSize, (y + corners[n][0].y) * spaceSize);
					ctx.lineTo((x + corners[n][1].x) * spaceSize, (y + corners[n][1].y) * spaceSize);
				}
			}
		}
	}
	ctx.stroke();
	
	ctx.fillStyle = "black"; // Draw start & finish.
	ctx.font = spaceSize + "px Arial";
	ctx.fillText("S", (((startPosition.x + 1) * spaceSize) - letterWidth)/2, ((startPosition.y + 1) * spaceSize) - (spaceSize - letterHeight)/2);
	ctx.fillText("F", (((finishPosition.x + 1) * spaceSize) - letterWidth)/2, ((finishPosition + 1) * spaceSize) - (spaceSize - letterHeight)/2);
}

// Main:
initCanvas();
initSpaces();
generate();
draw();