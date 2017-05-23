/* User Variables */
var gridHeight = Math.min(window.innerWidth, window.innerHeight);
var r = 9; // Number of spaces between center and corner.
var startPosition = {x: -r, y: 0};
/* End User Variables */

Math.ROOT_THREE = Math.sqrt(3);
var cols = r * 2 + 1;
var hexagonSideLength = gridHeight / (cols * Math.ROOT_THREE);
var gridWidth = hexagonSideLength * (3/2 * cols + 1/2);
var canvas;
var ctx;
var spaces;

// Basically rainbow tables:
var directions = [{x: 1, y: -1}, {x: 0, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 0}];
var directionsLength = directions.length;
var corners = [{x: 2, y: Math.ROOT_THREE/2}, {x: 3/2, y: 0}, {x: 1/2, y: 0},
	{x: 0, y: Math.ROOT_THREE/2}, {x: 1/2, y: Math.ROOT_THREE}, {x: 3/2, y: Math.ROOT_THREE}];

function initCanvas() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	canvas.width = gridWidth;
	canvas.height = gridHeight;
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
function generate() { // Depth-first backtracker search algorithm from: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker.
	var stack = [];
	var current = {x: startPosition.x, y: startPosition.y};
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
		} else if (stack.length) { // backtrack:
			current.x -= directions[stack[stack.length - 1]].x;
			current.y -= directions[stack[stack.length - 1]].y;
			stack.pop();
		} else {
			break; // we finished!
		}
	}
}
function draw() {
	ctx.fillStyle = "white"; // Draw background.
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.beginPath(); // Draw walls.
	ctx.strokeStyle = "black";
	ctx.scale(hexagonSideLength, hexagonSideLength);
	ctx.lineWidth = 2 / hexagonSideLength;
	for (var x = -r; x <= r; x++) {
		var drawX = (x + r) * 3/2; // * hexagonSideLength
		var colTopOffset = (x + 2*r) * Math.ROOT_THREE/2;
		var yStart = Math.max(-(r + x), -r);
		var yEnd = Math.min(r - x, r);
		for (var y = yStart; y <= yEnd; y++) {
			var drawY = y * Math.ROOT_THREE + colTopOffset; // * hexagonSideLength
			var space = spaces[x][y];
			for (var n = 0; n < directionsLength; n++) {
				ctx.translate(drawX, drawY);
				if (space[n]) {
					var nPrime = (n + 1) % corners.length;
					ctx.moveTo(corners[n].x, corners[n].y);
					ctx.lineTo(corners[nPrime].x, corners[nPrime].y);
				}
				ctx.translate(-drawX, -drawY);
			}
		}
	}
	ctx.stroke();
	spaces = null; // release memory.
}

// Main:
initCanvas();
//var startTime = new Date().getTime();
	initSpaces();
	generate();
//console.log("Took: " + (new Date().getTime() - startTime) + "ms");
requestAnimationFrame(draw);

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