/* User Variables */
var mazeSize = Math.min(window.innerWidth, window.innerHeight);
var mazeSpaces = 70; // Number of spaces along the side.
var startPosition = {x: 0, y: mazeSpaces - 1};
var finishPosition = {x: mazeSpaces - 1, y: mazeSpaces - 1};
/* End User Variables */

Math.ROOT_THREE = Math.sqrt(3);
var rows = mazeSpaces * 2 - 1;
var spaceSize = mazeSize / (rows * Math.ROOT_THREE);
var colOff = (mazeSize - (spaceSize * (1.5 * rows + 0.5))) / 2;
var canvas;
var ctx;
var spaces;
var solutionPath;

// Basically rainbow tables:
var directions = [{x: 1, y: -1}, {x: 0, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 0}]; // quadrant notation.
var corners = [{x: 2, y: Math.ROOT_THREE/2}, {x: 3/2, y: 0}, {x: 1/2, y: 0}, {x: 0, y: Math.ROOT_THREE/2}, {x: 1/2, y: Math.ROOT_THREE}, {x: 3/2, y: Math.ROOT_THREE}]; // quadrant notation.
function initCanvas() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	canvas.width = mazeSize;
	canvas.height = mazeSize;
}
function initSpaces() {
	spaces = new Array(rows);
	for (var x = 0; x < rows; x++) {
		spaces[x] = new Array(rows + Math.min((mazeSpaces - 1) - x, 0));
		for (var y = Math.max((mazeSpaces - 1) - x, 0); y < spaces[x].length; y++) {
			spaces[x][y] = new Array(directions.length);
			for (var n = 0; n <= directions.length; n++) {
				spaces[x][y][n] = (n != directions.length);
			}
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
	ctx.fillRect(0, 0, mazeSize, mazeSize);
	
	ctx.beginPath(); // Draw walls.
	ctx.lineWidth = 1;
	ctx.strokeStyle = "black";
	ctx.font = "20px Ubuntu";
	ctx.fillStyle = "black";
	var offX = spaceSize * 3 / 2;
	var offY = spaceSize * Math.ROOT_THREE;
	for (var x = 0; x < spaces.length; x++) {
		var start = Math.max((mazeSpaces - 1) - x, 0);
		var rowOff = (rows - (spaces[x].length - start)) * offY / 2;
		for (var arrayY = start; arrayY < spaces[x].length; arrayY++) {
			var y = arrayY - start;
			for (var n = 0; n < directions.length; n++) {
				if (spaces[x][arrayY][n]) {
					var nPrime = (n + 1) % corners.length;
					ctx.moveTo(x * offX + corners[n].x * spaceSize + colOff,
						y * offY + corners[n].y * spaceSize + rowOff);
					ctx.lineTo(x * offX + corners[nPrime].x * spaceSize + colOff,
						y * offY + corners[nPrime].y * spaceSize + rowOff);
				}
			}
		}
	}
	ctx.stroke();
	spaces = null; // release memory.
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
requestAnimationFrame(draw);

/* 
 * Useful Hexagon Grid Formulas:
 *
 * hexagon_width = 2 * hexagon_sidelength;
 * hexagon_height = Math.sqrt(3) * hexagon_sidelength;
 *
 * hexagongrid_columns = (hexagongrid_sidenodes * 2) - 1;
 * hexagongrid_height = hexagongrid_columns * hexagon_height;
 * hexagongrid_width = hexagon_sidelength * (1.5 * hexagongrid_columns + 0.5);
 */