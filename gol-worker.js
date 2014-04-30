var grid;

onmessage = function(e) {
    grid = e.data.grid;
    var nextGenGrid = createGrid(grid.length, grid[0].length, true); // Use to slice to pass by value

    // Perform calculations
    for(var y = e.data.startRow; y <= e.data.stopRow; y++) {
        for(var x = 0; x < grid[y].length; x++) {
            nextGenGrid[y][x] = processCell(y, x);
        }
    }

    // Return the calculated grid
    postMessage({
        "grid" : nextGenGrid,
        "startRow" : e.data.startRow,
        "stopRow" : e.data.stopRow
    });
};

function processCell(y, x) {
    var neighbourCount = 0;
    var alive = grid[y][x] === 1;

    // Count neighbours
    neighbourCount += (typeof grid[y][x-1] !== 'undefined') ? grid[y][x-1] : 0;
    neighbourCount += (typeof grid[y][x+1] !== 'undefined') ? grid[y][x+1] : 0;
    if(typeof grid[y-1] !== 'undefined') {
        neighbourCount += (typeof grid[y-1][x] !== 'undefined') ? grid[y-1][x] : 0;
        neighbourCount += (typeof grid[y-1][x-1] !== 'undefined') ? grid[y-1][x-1] : 0;
        neighbourCount += (typeof grid[y-1][x+1] !== 'undefined') ? grid[y-1][x+1] : 0;
    }
    if(typeof grid[y+1] !== 'undefined') {
        neighbourCount += (typeof grid[y+1][x] !== 'undefined') ? grid[y+1][x] : 0;
        neighbourCount += (typeof grid[y+1][x-1] !== 'undefined') ? grid[y+1][x-1] : 0;
        neighbourCount += (typeof grid[y+1][x+1] !== 'undefined') ? grid[y+1][x+1] : 0;
    }

    // Return status of cell
    if((alive && neighbourCount === 2)
        || (alive && neighbourCount === 3)
        || (!alive && neighbourCount === 3)) {
        return 1;
    }
    return 0;
}

function createGrid(y, x) {
    g = [];
    for(i = 0; i < y; i++) {
        g[i] = [];
        for(j = 0; j < x; j++) {
            g[i][j] = 0;
        }
    }
    return g;
}