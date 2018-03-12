#include <iostream>
#include <SFML/Graphics.hpp>
#include <random>
#include <stack>

// classes and structs
template <typename T>
class Vec {
	public:
		T x;
		T y;
		Vec<T>(T _x, T _y) {
			x = _x;
			y = _y;
		}
		Vec<T> operator+(Vec<T> vec) {
			return Vec<T>(x + vec.x, y + vec.y);
		}
		Vec<T> operator*(Vec<T> vec) {
			return Vec<T>(x * vec.x, y * vec.y);
		}
		Vec<T> operator*(T num) {
			return Vec<T>(x * num, y * num);
		}
		void operator+=(Vec<T> vec) {
			x += vec.x;
			y += vec.y;
		}
		void operator-=(Vec<T> vec) {
			x -= vec.x;
			y -= vec.y;
		}
};
struct Tile {
	int color;
	bool walls[6];
};

// global variables
const double rootThree = sqrt(3);
const int r = 49;
const int cols = r * 2 + 1;
const Vec<int> directions[] = {{1, -1}, {0, -1}, {-1, 0}, {-1, 1}, {0, 1}, {1, 0}};
const Vec<double> corners[] = {{2, rootThree/2.0}, {1.5, 0}, {0.5, 0}, {0, rootThree/2.0}, {0.5, rootThree}, {1.5, rootThree}};

// functions
const auto h2cc = [](double x)->double {
	return std::min(1.0, std::max(0.0, std::abs(x - (std::floor(x / 6.0) * 6.0) - 3.0) - 1.0));
};
sf::Color hueToColor(double hue) { //https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV
	return sf::Color(h2cc(hue * 6.0) * 255, h2cc(hue * 6.0 + 4.0) * 255, h2cc(hue * 6.0 + 8.0) * 255);
}
bool isValid(Vec<int> index) {
	if (index.x >= -r && index.x <= r) {
		const int start = std::max(-(r + index.x), -r);
		const int end = std::min(r - index.x, r);
		return (index.y >= start && index.y <= end);
	}
	return false;
}
Tile* getTile(Tile** tiles, Vec<int> index) {
	const int start = std::max(-(r + index.x), -r);
	return tiles[index.x + r] + (index.y - start);
}
void drawLine(sf::RenderTexture* window, Vec<double> start, Vec<double> end, sf::Color color) {
	const sf::Vertex line[2] = {{sf::Vector2f(start.x, start.y), color}, {sf::Vector2f(end.x, end.y), color}};
	window->draw(line, 2, sf::Lines);
}
void fillHexagon(sf::RenderTexture* window, Vec<double> offset, double sidelength, sf::Color color) {
	sf::Vertex hexagon[8];
	hexagon[0] = {sf::Vector2f((offset.x + 1) * sidelength, (offset.y + rootThree/2.0) * sidelength), color};
	for (int n = 0; n < 6 + 1; n++) {
		const Vec<double> corner = (offset + corners[n % 6]) * sidelength;
		hexagon[n + 1] = {sf::Vector2f(corner.x, corner.y), color};
	}
	window->draw(hexagon, 8, sf::TrianglesFan);
}

int main() {
	// construct hexagon grid
	Tile** tiles = new Tile*[cols];
	for (int x = 0; x < cols; x++) {
		int length = cols - std::abs(x - r);
		Tile* col = tiles[x] = new Tile[length];
		for (int y = 0; y < length; y++) {
			col[y] = (Tile) {0, new bool[6]};
			Tile* tile = col + y;
			for (int n = 0; n < 6; n++) {
				tile->walls[n] = true;
			}
		}
	}

	// init rng
	unsigned int seed;
	{
		std::random_device rd;
		seed = rd();
	}
	std::minstd_rand rng(seed);

	// generate maze
	{
		Vec<int> current(0, 0);
		getTile(tiles, current)->color = 1;
		std::stack<int> path;
		int neighbors[6];
		int length;
		do {
			length = 0;
			for(int n = 0; n < 6; n++) {
				Vec<int> direction = directions[n];
				Vec<int> neighbor = current + direction;
				if (isValid(neighbor) && !getTile(tiles, neighbor)->color) {
					neighbors[length++] = n;
				}
			}
			if (length) {
				std::uniform_int_distribution<int> randNeighbor(0, length - 1);
				const int nextIndex = neighbors[randNeighbor(rng)];
				path.push(nextIndex);
				getTile(tiles, current)->walls[nextIndex] = false;
				current += directions[nextIndex];
				Tile* next = getTile(tiles, current);
				next->walls[(nextIndex + 6/2) % 6] = false;
				next->color = (path.size() % 300) + 1;
			} else {
				current -= directions[path.top()];
				path.pop();
			}
		} while(path.size());
	}

	// init window
	/*sf::ContextSettings settings;
	settings.antialiasingLevel = 0;*/
	sf::RenderWindow window(sf::VideoMode(418, 480), "Rainbow Hex Maze Generator", sf::Style::/*Default*/Fullscreen/*, settings*/);
	sf::Vector2u size = window.getSize();
	const unsigned int height = size.y;
	const double sidelength = height / (rootThree * cols);
	const unsigned int width = std::ceil((1.5 * cols + 0.5) * sidelength);
	sf::RenderTexture rndrTxtr;
	rndrTxtr.create(width, height);

	// drawing
	rndrTxtr.clear(sf::Color(0, 0, 0, 0));
	Vec<double> offset(0, 0);
	for(int x = -r; x <= r; x++) {
		offset.x = (x + r) * 3.0/2.0;
		const int start = std::max(-r, -(r + x));
		const int end = std::min(r, r - x);
		for(int y = start; y <= end; y++) {
			offset.y = (y + (x/2.0 + r)) * rootThree;
			const Tile* tile = getTile(tiles, Vec<int>{x, y});
			fillHexagon(&rndrTxtr, offset, sidelength, hueToColor((tile->color - 1) / 300.0));
			for(int n = 0; n < 6; n++) {
				if (tile->walls[n]) {
					drawLine(&rndrTxtr, (offset + corners[n]) * sidelength, (offset + corners[(n + 1) % 6]) * sidelength, sf::Color::Black);
				}
			}
		}
	}
	rndrTxtr.display();
	window.clear();
	window.draw(sf::Sprite(rndrTxtr.getTexture()));
	window.display();

	// sfml loop
	while (window.isOpen()) {
		sf::Event event;
		while (window.pollEvent(event)) {
			switch (event.type) {
				case sf::Event::Closed:
					window.close();
					break;
				case sf::Event::KeyPressed:
					switch(event.key.code) {
						case sf::Keyboard::Escape:
							window.close();
							break;
						case sf::Keyboard::S:
							rndrTxtr.getTexture().copyToImage().saveToFile("cppHexagonalMaze_seed=" + std::to_string(seed) + "_r=" + std::to_string(r) + ".png");
							window.close();
							break;
					}
					break;
				default:
					break;
			}
		}
	}
}
/*
g++ -std=c++11 -c ./rainbowHexagonMazeGenerator.cpp
g++ ./rainbowHexagonMazeGenerator.o -o rainbowHexagonMazeGenerator -lsfml-graphics -lsfml-window -lsfml-system
./rainbowHexagonMazeGenerator
*/
