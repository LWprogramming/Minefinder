//TODO FOR NEXT TIME:
// 1. implement logic for clicking a cell with a 0--i.e. reveal all its neighbors recursively so that for any of its neighbors that are zero, reveal all of their neighbors as well.
// 2. Implement right-click logic. Legal transitions are: unclicked to rightclicked, rightclicked to unclicked, uncliked to clicked, rightclicked to clicked.
// 3. implement logic to stop the game if a mine is clicked. also display a game-over message.
// 4. add reset button that can be clicked at any time. erases the game over message.

/*
Other assorted things (no set timeline)
- add difficulty settings (easy medium hard) as presets
- allow user to input their choice of dimensions and number of mines. put in some sort of limit on this, though--can't support 9 million cells, for instance. also put in a check so that the number of mines doesn't exceed the number of cells.
- refactor button.id (anything labeled COORDINATE). See comments there to see--basically try to avoid manipulating strings for everything.
- refactor generateGameBoard to take parameters instead of relying on global variables numRows, numCols, and numMines.
- this entire program is run regarless of whether javascript is allowed when viewing this in chrome or not. not sure why; commenting it out prevents it from being run, so probably an issue with chrome settings or whatever, not js.
- add a game timer
- add game statistics (that can be reset of course) and leaderboard
- support chording--look up minesweeper wiki for this.
- make the website independent of browser, version, mobile vs desktop, etc.

- overall plan-- implement logic => design/UI/UX => github pages => user testing.
*/ 


// If Javascript is not disabled, then remove the message saying that it is.
var jsDisabledMessage = document.getElementById("Javascript disabled message");
jsDisabledMessage.parentNode.removeChild(jsDisabledMessage);

var DEBUG = true; 

// game parameters
var numRows = 6;
var numCols = 6;
var numMines = 5;

// cell status must be one of these.
var cellStatusEnum = {
    UNCLICKED: 0,
    CLICKED: 1,
    RIGHTCLICKED: -1
}

function cell(row, col, status=cellStatusEnum.UNCLICKED, mineStatus=-2) {
    // represents one cell on the board.
    this.row = row;
    this.col = col;
    this.status = status;
    this.mineStatus = mineStatus; // -1 indicates this cell is a mine; 0-8 indicates number of adjacent mines. -2 indicates this didn't get initialized--this shouldn't happen but potentially a useful flag.
}

function numAdjacent(row, col, mineLocations) {
    // returns the number of mines adjacent to the cell with given row and column.
    // mineLocations is an array of cells that are the locations of the mines.
    var adj = 0;
    mineLocations.forEach(function(cell, index, array) {
        if ((row <= cell.row + 1) && (row >= cell.row - 1) && 
            (col <= cell.col + 1) && (col >= cell.col - 1)) {
            adj++;
        }
    });
    return adj;
}

/* Constructs game board given numRows, numCols, and numMines. Returns 2-D array representing the board state of dimensions numRows x numCols. */
function generateGameBoard() {
    var gameBoard = [];
    for (var row = 0; row < numRows; row++) {
        var rowArray = [];
        for (var col = 0; col < numCols; col++) {
            rowArray.push(new cell(row, col));
        }
        gameBoard.push(rowArray);
    }
    // generate random locations for mines.
    var mineLocations = []; // handy list of mine coordinates for convenience. Can be derived from gameBoard but this is more convenient.
    for (var i = 0; i < numMines; i++){
        var row = Math.floor(Math.random() * numRows);
        var col = Math.floor(Math.random() * numCols);
        gameBoard[row][col].mineStatus = -1;
        mineLocations.push(new cell(row, col));
    }

    // assign numbers to non-numerical cells
    for (var row = 0; row < numRows; row++) {
        for (var col = 0; col < numCols; col++) {
            if (gameBoard[row][col].mineStatus != -1) {
                // If the given cell doesn't have a mine, then we need the number of mines around it.
                gameBoard[row][col].mineStatus = numAdjacent(row, col, mineLocations);
            }
        }
    }
    return gameBoard;
}

var gameBoard = generateGameBoard();

// useful for simulating clicks
var clickEvent = new MouseEvent("click", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": false
                });

// Put together game board.
for (var row = 0; row < numRows; row++) {
    var divRow = document.createElement('div');
    divRow.className = 'row';
    for (var col = 0; col < numCols; col++) {
        var button = document.createElement('button');
        button.id = 'button' + row + col;
        // refactor this from trying to manipulate strings and into some more coherent pattern, such as an object with a row and column or something. See all locations tagged with the word COORDINATE.
        // https://stackoverflow.com/a/16775485
        button.typeName = 'button';
        button.innerHTML = '.';
        button.className = 'button col-xs-' + 12 / numCols;
        // button.row = row;
        // button.colum = col; // COORDINATE
        button.onclick = function() {
            console.log(this.id);
            this.clicked = CLICKED;
            if (DEBUG) {
                this.style.background = 'cyan';
            }
            var thisRow = this.id[6]; // COORDINATE
            var thisCol = this.id[7]; // COORDINATE
            if (gameBoard[thisRow][thisCol].mineStatus == 0) {
                // no mines, click all adjacent cells as well.
                
                /* CONTINUE HERE NEXT TIME
                Implementation logic:
                add list of cells to adjacentCellsList iff we don't go off the edge of the board AND that particular cell hasn't been already clicked (otherwise we run into problems with two adjacent cells that are both zero).
                */
                // adjacentCellsList = 

                // document.getElementById('button' + (thisRow - 1) + thisCol).dispatchEvent(clickEvent);
                
            }
            if (gameBoard[thisRow][thisCol].mineStatus == -1) {
                // clicked a mine
                if (DEBUG) {
                    console.log("Game over!");
                }
            }
        }
        divRow.appendChild(button);
    }
    document.getElementById('grid').appendChild(divRow);
}

// fill out each button with the correct content.
for (var row = 0; row < numRows; row++) {
    for (var col = 0; col < numCols; col++) {
        var symbol;
        if (gameBoard[row][col].mineStatus != -1) {
            symbol = '' + gameBoard[row][col].mineStatus;
        }
        else {
            symbol = "*"; // for mines
        }
        document.getElementById('button' + row + col).innerHTML = symbol; //COORDINATE
    }
}
