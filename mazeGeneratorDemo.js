var mazeSize = 600; // Dimensions of canvas in pixels.
var mazeSpaces = 12; // Number of spaces in the x and y directions.

var startPosition = {x: 0, y: 0};
var spaceSize = mazeSize / mazeSpaces;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = mazeSize;
canvas.height = mazeSize;
var spaces = [];
var stack = [];
var current = {x: startPosition.x, y: startPosition.y};
var next;
var neighbors = [];
// Basically rainbow tables:
var directions = [{x: 1, y: 0, t: "r", f: "l"}, {x: 0, y: -1, t: "u", f: "d"}, {x: -1, y: 0, t: "l", f: "r"}, {x: 0, y: 1, t: "d", f: "u"}];
//var dirs = ["r", "u", "l", "d"];
var corners = {r: [[1, 0], [1, 1]], u: [[0, 0], [1, 0]], l: [[0, 0], [0, 1]], d: [[0, 1], [1, 1]]};

ctx.strokeStyle = "white"/*FFFFFF*/;
ctx.lineWidth = 2;

function renderMaze() {
	ctx.clearRect(0, 0, mazeSize, mazeSize);
	for (var i = 0; i < mazeSpaces; i++) {
		for (var n = 0; n < mazeSpaces; n++) {
			ctx.beginPath();
			ctx.fillStyle = spaces[n][i].v ? "indigo"/*#4B0082*/ : "grey"/*#808080*/;
			ctx.rect(n * spaceSize, i * spaceSize, spaceSize, spaceSize);
			ctx.fill();
			ctx.beginPath();
			for (var j = 0; j < directions.length; j++) {
				if (spaces[n][i][directions[j].t]) {
					ctx.moveTo((n + corners[directions[j].t][0][0]) * spaceSize, (i + corners[directions[j].t][0][1]) * spaceSize);
					ctx.lineTo((n + corners[directions[j].t][1][0]) * spaceSize, (i + corners[directions[j].t][1][1]) * spaceSize);
				}
			}
			ctx.stroke();
		}
	}
	ctx.beginPath();
	ctx.fillStyle = "red";
	ctx.rect((current.x + 0.25) * spaceSize, (current.y + 0.25) * spaceSize, spaceSize/2, spaceSize/2);
	ctx.fill();
	ctx.beginPath();
	ctx.strokeStyle = "red";
	for (var n = 0; n + 1 < stack.length; n++) {
		ctx.moveTo((stack[n].x * spaceSize) + (spaceSize/2), (stack[n].y * spaceSize) + (spaceSize/2));
		ctx.lineTo((stack[n + 1].x * spaceSize) + (spaceSize/2), (stack[n + 1].y * spaceSize) + (spaceSize/2));
	}
	ctx.stroke();
	ctx.strokeStyle = "white";
}

function stepSearch() { // Depth-first /*recursive*/ backtracker search algorithm from: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker.
	if (!spaces[current.x][current.y].v) {
		spaces[current.x][current.y].v = true;
		stack[stack.length] = {x: current.x, y: current.y};
		return;
	}
	for (var n = 0; n < directions.length; n++) {
		checkNeighbor(current.x + directions[n].x, current.y + directions[n].y, directions[n].t, directions[n].f);
	}
	if (neighbors.length == 0) {
		stack.splice(stack.length - 1, 1);
		current = stack[stack.length - 1];
		if (current == null) {
			current = {x: startPosition.x, y: startPosition.y};
			return true;
		}
		//stepSearch(); // I don't want it to recurse.
		return;
	}
	next = neighbors.splice(~~(Math.random()*neighbors.length), 1)[0];
	spaces[current.x][current.y][next.t] = false;
	spaces[next.x][next.y][next.f] = false;
	current = {x: next.x, y: next.y};
	stack[stack.length] = {x: current.x, y: current.y};
	spaces[current.x][current.y].v = true;
	neighbors = [];
}

function checkNeighbor(x, y, to, from) {
	if (spaces[x] && spaces[x][y] && !spaces[x][y].v) {
		neighbors[neighbors.length] = {x: x, y: y, t: to, f: from};
	}
}

function initSpaces() {
	for (var n = 0; n < mazeSpaces; n++) {
		spaces[n] = [];
		for (var i = 0; i < mazeSpaces; i++) {
			spaces[n][i] = {r: true, u: true, l: true, d: true, v: false}; // Right, up, left, down (walls), visited.
		}	
	}
}

initSpaces();
function main() {
	if (!stepSearch()) {
		setTimeout(main, 250);
	}
	renderMaze();
}
main();