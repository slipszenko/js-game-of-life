var grid = createGrid(25, 50, false);
var times = [];
var generation = 0;
var nWorkers = 2; // The number of workers to use, no greater than 8 until I find a better way to divide labour
var returnedWorkers = 0;
var workers = [];
var nextGenGrid;
var iterationsToGo = 0;

function createGrid(y, x, empty) {
    g = [];
    for(i = 0; i < y; i++) {
        g[i] = [];
        for(j = 0; j < x; j++) {
            g[i][j] = empty ? 0 : getRandomInt(0, 1);
        }
    }
    return g;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toggleCell() {
    // Swap the value of this cell in the grid var and mark it as alive as appropriate
    this.classList.toggle("cell-alive");
    coords = this.id.split("-");
    y = coords[1];
    x = coords[2];
    if(grid[y][x] === 1) {
        grid[y][x] = 0;
    } else {
        grid[y][x] = 1;
    }
}

function buildTable(gridToDraw) {
    var tableHTML = "";
    for(var y = 0; y < gridToDraw.length; y++) {
        tableHTML += "<tr>"
        for(var x = 0; x < gridToDraw[y].length; x++) {
            tableHTML += '<td id="cell-' + y + '-' + x + '" class="cell' + (gridToDraw[y][x] === 1 ? ' cell-alive' : '') +'"></td>';
        }
        tableHTML += "</tr>";
    }
    document.querySelector("table").innerHTML = tableHTML;

    // Set up toggle events on the table
    var cells = document.querySelectorAll(".cell");
    for(var i = 0; i < cells.length; i++) {
        cells[i].addEventListener("click", toggleCell);
    }
}

function nextGeneration() {
    nextGenGrid = createGrid(grid.length, grid[0].length, true);
    //var start = new Date().getTime();
    var divider = Math.ceil(grid.length / nWorkers);

    for(var i = 0; i < nWorkers; i++) {
        workers[i].onmessage = function(e) {
            for(var j = e.data.startRow; j < e.data.stopRow; j++) {
                nextGenGrid[j] = e.data.grid[j];
            }

            returnedWorkers++;
            if(returnedWorkers == nWorkers) {
                returnedWorkers = 0;
                generationComplete();
            }
        };

        var startRow = i * divider;
        var stopRow = startRow + divider - 1;
        if(stopRow > grid.length) {
            stopRow = stopRow - i;
        }
        console.log(startRow, stopRow);
        workers[i].postMessage({
            "grid" : grid,
            "startRow" : startRow,
            "stopRow" : stopRow
        });
    }

    //var stop = new Date().getTime();
    //times[times.length] = stop - start;
}

function generationComplete() {
    // Update and redraw the grid
    grid = nextGenGrid;
    buildTable(grid);
    generation++;
    document.querySelector("#generation-count").innerHTML = generation;

    // Go to the next generation?
    iterationsToGo--;
    if(iterationsToGo > 0) {
        // Add a slight pause so the animation can be seen
        window.setTimeout(nextGeneration, 50);
    }
}

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

function startProcessing() {
    iterationsToGo = parseInt(document.querySelector("#how-many-gens").value);
    nextGeneration();
}

function averageTime() {
    totalTime = 0;
    for(var i = 0; i < times.length; i++) {
        totalTime += times[i];
    }
    return totalTime / times.length;
}

function restart() {
    grid = createGrid(25, 50, false);
    times = [];
    generation = 0;
    buildTable(grid);
    document.querySelector("#generation-count").innerHTML = 0;
}

function init() {
    // Create the blank table
    buildTable(grid);

    // Set up the workers
    for(var i = 0; i < nWorkers; i++) {
        workers[i] = new Worker("gol-worker.js");
    }

    // Activate the next generation button
    document.querySelector("#start-button").addEventListener("click", startProcessing);

    // Activate the restart button
    document.querySelector("#restart").addEventListener("click", restart);
}
window.addEventListener("load", init);