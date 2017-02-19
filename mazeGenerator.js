var mazeSize = 1080; // Dimensions of canvas in pixels.
var mazeSpaces = 100; // Number of spaces in the x and y directions.

var startPosition = {x: 0, y: 0};
var finishPosition = {x: mazeSpaces - 1, y: mazeSpaces - 1};
var spaceSize = mazeSize / mazeSpaces;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var spaces;
var stack = [];
var current = {x: startPosition.x, y: startPosition.y};
var next;
var neighbors = [];
var solutionPath;
// Basically rainbow tables:
var directions = [{x: 1, y: 0, t: "r", f: "l"}, {x: 0, y: -1, t: "u", f: "d"}, {x: -1, y: 0, t: "l", f: "r"}, {x: 0, y: 1, t: "d", f: "u"}];
var corners = {r: [[1, 0], [1, 1]], u: [[0, 0], [1, 0]], l: [[0, 0], [0, 1]], d: [[0, 1], [1, 1]]};

//ctx.lineWidth = 1/2;
canvas.height = mazeSize + (ctx.lineWidth);
canvas.width = canvas.height; // So the borders are shown better.
ctx.translate(~~(ctx.lineWidth/2), ~~(ctx.lineWidth/2));

ctx.strokeStyle = "black";
ctx.font = spaceSize + "px Arial";
var letterWidth = ctx.measureText("S").width;
var letterHeight = spaceSize - (2/15*2*spaceSize);

canvas.style.width = Math.min(window.innerWidth, window.innerHeight)-4 + "px";
canvas.style.height = canvas.style.width;

function generate() { // Depth-first backtracker search algorithm from: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker.
	while(true) {
		if (!spaces[current.x][current.y].v) {
			spaces[current.x][current.y].v = true;
			stack[stack.length] = {x: current.x, y: current.y};
			continue;
		}
		/*if (current.x == finishPosition.x && current.y == finishPosition.y) {
			for(var n = 0; n < stack.length; n++) { // Set solution.
				solutionPath[n] = {x: stack[n].x, y: stack[n].y};
			}
		}*/
		for (var n = 0; n < directions.length; n++) {
			checkNeighbor(current.x + directions[n].x, current.y + directions[n].y, directions[n].t, directions[n].f);
		}
		if (neighbors.length == 0) {
			stack.splice(stack.length - 1, 1);
			current = stack[stack.length - 1];
			if (current == null) {
				current = {x: startPosition.x, y: startPosition.y};
				break;
			}
			continue;
		}
		next = neighbors.splice(~~(Math.random()*neighbors.length), 1)[0];
		spaces[current.x][current.y][next.t] = false;
		spaces[next.x][next.y][next.f] = false;
		current = {x: next.x, y: next.y};
		stack[stack.length] = {x: current.x, y: current.y};
		spaces[current.x][current.y].v = true;
		neighbors = [];
	}
}
function checkNeighbor(x, y, to, from) {
	if (spaces[x] && spaces[x][y] && !spaces[x][y].v) {
		neighbors[neighbors.length] = {x: x, y: y, t: to, f: from};
	}
}
function initSpaces() {
	spaces = new Array(mazeSpaces);
	for (var n = 0; n < mazeSpaces; n++) {
		spaces[n] = new Array(mazeSpaces);
		for (var i = 0; i < mazeSpaces; i++) {
			spaces[n][i] = {r: true, u: true, l: true, d: true, v: false}; // Right, up, left, down (walls), visited.
		}	
	}
}

// Main:
initSpaces();
generate();
// Draw:
ctx.fillStyle = "white"; // background
ctx.fillRect(0, 0, mazeSize, mazeSize);
ctx.beginPath(); // Draw walls.
ctx.lineWidth = 2;
for (var i = 0; i < mazeSpaces; i++) {
	for (var n = 0; n < mazeSpaces; n++) {
		for (var j = 0; j < directions.length; j++) {
			if (spaces[n][i][directions[j].t]) {
				ctx.moveTo(~~((n + corners[directions[j].t][0][0]) * spaceSize), ~~((i + corners[directions[j].t][0][1]) * spaceSize));
				ctx.lineTo(~~((n + corners[directions[j].t][1][0]) * spaceSize), ~~((i + corners[directions[j].t][1][1]) * spaceSize));
			}
		}
	}
}
ctx.stroke();
ctx.fillStyle = "black";
ctx.fillText("S", (((startPosition.x + 1) * spaceSize) - letterWidth)/2, ((startPosition.y + 1) * spaceSize) - (spaceSize - letterHeight)/2);
ctx.fillText("F", (((finishPosition.x + 1) * spaceSize) - letterWidth)/2, ((finishPosition + 1) * spaceSize) - (spaceSize - letterHeight)/2);