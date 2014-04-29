var grid = createGrid(25, 50);
var times = [];

function createGrid(y, x) {
    g = [];
    for(i = 0; i < y; i++) {
        g[i] = [];
        for(j = 0; j < x; j++) {
            g[i][j] = getRandomInt(0, 1);
        }
    }
    return g;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var myWorker = new Worker("gol-worker.js");

myWorker.onmessage = function(oEvent) {
    console.log("Worker said : " + oEvent.data);
};


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
    var nextGenGrid = createGrid(grid.length, grid[0].length);
    var start = new Date().getTime();

    // Perform calculations
    for(var y = 0; y < grid.length; y++) {
        for(var x = 0; x < grid[y].length; x++) {
            nextGenGrid[y][x] = processCell(y, x);
        }
    }

    var stop = new Date().getTime();
    times[times.length] = stop - start;

    // Update and redraw the grid
    grid = nextGenGrid;
    buildTable(grid);
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
    var iterations = parseInt(document.querySelector("#how-many-gens").value);
    for(var i = 0; i < iterations; i++) {
        window.setTimeout(nextGeneration, 100 * i);
    }
}

function averageTime() {
    totalTime = 0;
    for(var i = 0; i < times.length; i++) {
        totalTime += times[i];
    }
    console.log(totalTime);
    console.log(times.length);
    return totalTime / times.length;
}

function init() {
    // Create the blank table
    buildTable(grid);

    // Activate the next generation button
    document.querySelector("#next-generation").addEventListener("click", startProcessing);

    myWorker.postMessage("ali");
}
window.addEventListener("load", init);