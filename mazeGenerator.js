/* User Variables */
var mazeSize = Math.min(window.innerWidth, window.innerHeight); // Canvas dimensions might be smaller!
var mazeSpaces = 100; // Number of spaces in the x and y directions.
var startPosition = {x: 0, y: 0};
var finishPosition = {x: mazeSpaces - 1, y: mazeSpaces - 1};
/* End User Variables */

var spaceSize = Math.max(~~(mazeSize / mazeSpaces), 2);
var canvas;
var ctx;
var spaces;
var solutionPath;

// Basically rainbow tables:
var directions = [{x: 1, y: 0}, {x: 0, y: -1}, {x: -1, y: 0}, {x: 0, y: 1}]; // right, up, left, down.
var corners = [{x: 1, y: 1}, {x: 1, y: 0}, {x: 0, y: 0}, {x: 0, y: 1}]; // SE, NE, NW, SW.

function initCanvas() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	mazeSize = mazeSpaces * spaceSize + 1;
	
	canvas.width = mazeSize;
	canvas.height = mazeSize;
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
	
	do {
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
			current.x -= directions[stack[stack.length - 1]].x;
			current.y -= directions[stack[stack.length - 1]].y;
			stack.pop();
		}
	} while (stack.length);
}
function draw() {
	ctx.fillStyle = "white"; // Draw background.
	ctx.fillRect(0, 0, mazeSize, mazeSize);
	
	ctx.beginPath(); // Draw walls.
	ctx.lineWidth = 1;
	ctx.strokeStyle = "black";
	for (var y = 0; y < mazeSpaces; y++) {
		for (var x = 0; x < mazeSpaces; x++) {
			for (var n = 0; n < directions.length; n++) {
				if (spaces[x][y][n]) {
					ctx.moveTo((x + corners[n].x) * spaceSize + 0.5, (y + corners[n].y) * spaceSize + 0.5);
					ctx.lineTo((x + corners[(n + 1) % corners.length].x) * spaceSize + 0.5,
						(y + corners[(n + 1) % corners.length].y) * spaceSize + 0.5);
				}
			}
		}
	}
	ctx.stroke();
}
function downloadMaze() {
	var link = document.createElement('a');
	link.href = canvas.toDataURL();
	link.download = mazeSpaces + 'WideMaze@' + canvas.width + 'p.png';
	//document.body.appendChild(link);
	link.click();
}

// Main:
initCanvas();
initSpaces();
generate();
draw();
spaces = null; // release memory.