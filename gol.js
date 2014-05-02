var grid = createGrid(25, 4000, false);
var times = [];
var generation = 0;
var nWorkers = 1; // The number of workers to use, no greater than 8 until I find a better way to divide labour
var returnedWorkers = 0;
var workers = [];
var nextGenGrid = createGrid(grid.length, grid[0].length, true);
var iterationsToGo = 0;

var startTime, stopTime;
var totalTime = 0;

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
    var divider = Math.ceil(grid.length / nWorkers);
    startTime = new Date().getTime();

    for(var i = 0; i < nWorkers; i++) {
        workers[i].onmessage = function(e) {
            for(var j = e.data.startRow; j <= e.data.stopRow; j++) {
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
        if(stopRow > grid.length - 1) {
            stopRow = stopRow - i;
        }
        
        workers[i].postMessage({
            "grid" : grid,
            "startRow" : startRow,
            "stopRow" : stopRow
        });
    }
}

function generationComplete() {
    stopTime = new Date().getTime();
    totalTime += stopTime - startTime;

    // Update and redraw the grid
    grid = nextGenGrid;
    buildTable(grid);
    nextGenGrid = createGrid(grid.length, grid[0].length, true);
    generation++;
    document.querySelector("#generation-count").innerHTML = generation;

    // Go to the next generation?
    iterationsToGo--;
    if(iterationsToGo > 0) {
        // Add a slight pause so the animation can be seen
        window.setTimeout(nextGeneration, 50);
    } else {
        console.log("Total time: " + totalTime);
    }
}

function startProcessing() {
    iterationsToGo = parseInt(document.querySelector("#how-many-gens").value);
    nextGeneration();
}

function restart() {
    grid = createGrid(grid.length, grid[0].length, false);
    times = [];
    generation = 0;
    buildTable(grid);
    document.querySelector("#generation-count").innerHTML = 0;
}

function workerSliderChange() {
    nWorkers = document.querySelector("#workers-to-use").value;
    document.querySelector("#workers-in-use").innerHTML = nWorkers;

    // Set up the workers
    workers = [];
    for(var i = 0; i < nWorkers; i++) {
        workers[i] = new Worker("gol-worker.js");
    }
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

    // Activate the workers slider
    document.querySelector("#workers-in-use").innerHTML = nWorkers;
    document.querySelector("#workers-to-use").value = nWorkers;
    document.querySelector("#workers-to-use").addEventListener("change", workerSliderChange);
}
window.addEventListener("load", init);