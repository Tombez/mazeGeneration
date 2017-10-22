# mazeGeneration

Useful Hexagon/Grid Formulas:

hexagon_width = 2 * hexagon_sidelength;
hexagon_height = Math.sqrt(3) * hexagon_sidelength;

hexagongrid_columns = (hexagongrid_sidenodes * 2) - 1;
hexagongrid_height = Math.sqrt(3) * hexagon_sidelength * hexagongrid_columns;
hexagongrid_width = hexagon_sidelength * (3/2 * hexagongrid_columns + 1/2);