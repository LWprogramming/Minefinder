// If Javascript is not disabled, then remove the message saying that it is.
var jsDisabledMessage = document.getElementById("Javascript disabled message");
jsDisabledMessage.parentNode.removeChild(jsDisabledMessage);
// TODO: this entire program is run regarless of whether javascript is allowed when viewing this in chrome or not. not sure why; commenting it out prevents it from being run, so probably an issue with chrome settings or whatever, not js.

var DEBUG = true; 

// game parameters
var numRows = 6;
var numCols = 6;
var numMines = 5; // todo: put in a check so that the number of mines doesn't exceed the number of cells.

// cell status must be one of these.
var cellStatusEnum = {
    UNCLICKED: 0,
    CLICKED: 1,
    RIGHTCLICKED: -1
}

function cell(row, col, status=cellStatusEnum.UNCLICKED) {
    // represents one cell on the board.
    this.row = row;
    this.col = col;
    this.clicked = status;


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

/*
Constructs game board given numRows, numCols, and numMines. Returns 2-D array representing the board state of dimensions numRows x numCols.

todo: refactor this to take parameters instead of relying on global variables numRows, numCols, and numMines.
*/
function generateGameBoard() {
    // var gameBoard = Array(numRows).fill(Array(numCols).fill(0)); // placeholder to make everything zero at first.

    var gameBoard = [];
    for (var row = 0; row < numRows; row++) {
        var rowArray = [];
        for (var col = 0; col < numCols; col++) {
            rowArray.push(0);
        }
        gameBoard.push(rowArray);
    }
    /** gameBoard[row][col] is 2-D int array representing the status of the cells. If a given element is -1, then there is a mine at that location; otherwise, the number is the number of mines around it. */

    // generate random locations for mines.
    var mineLocations = []; // handy list of mine coordinates for convenience. Can be derived from gameBoard but this is more convenient.
    for (var i = 0; i < numMines; i++){
        var row = Math.floor(Math.random() * numRows);
        var col = Math.floor(Math.random() * numCols);
        gameBoard[row][col] = -1; // -1 indicates is a mine.
        mineLocations.push(new cell(row, col));
    }

    // assign numbers to non-numerical cells
    for (var row = 0; row < numRows; row++) {
        for (var col = 0; col < numCols; col++) {
            if (gameBoard[row][col] != -1) {
                // If the given cell doesn't have a mine, then we need the number of mines around it.
                // console.log(gameBoard[row][col]);
                gameBoard[row][col] = numAdjacent(row, col, mineLocations);
            }
        }
    }

    return gameBoard;
}

var gameBoard = generateGameBoard();

// console.log(gameBoard);

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
        // TODO: refactor this from trying to manipulate strings and into some more coherent pattern, such as an object with a row and column or something. See all locations tagged with the word COORDINATE.
        // https://stackoverflow.com/a/16775485
        button.typeName = 'button';
        button.innerHTML = '.';
        button.className = 'button col-xs-' + 12 / numCols;
        // button.row = row;
        // button.colum = col; // todo fix this at some point. COORDINATE
        button.onclick = function() {
            console.log(this.id);
            if (DEBUG) {
                this.style.background = 'cyan';
            }
            var thisRow = this.id[6]; // COORDINATE
            var thisCol = this.id[7]; // COORDINATE
            if (gameBoard[thisRow][thisCol] == 0) {
                // no mines, click all adjacent cells as well.
                
                /* CONTINUE HERE NEXT TIME
                Implementation logic:
                add list of cells to adjacentCellsList iff we don't go off the edge of the board AND that particular cell hasn't been already clicked (otherwise we run into problems with two adjacent cells that are both zero).
                */
                // adjacentCellsList = 

                // document.getElementById('button' + (thisRow - 1) + thisCol).dispatchEvent(clickEvent);
                
            }
            if (gameBoard[thisRow][thisCol] == -1) {
                // clicked a mine
                if (DEBUG) {
                    console.log("Game over!");
                }
                //TODO: implement code if it's not in debug mode.
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
        if (gameBoard[row][col] != -1) {
            symbol = '' + gameBoard[row][col];
        }
        else {
            symbol = "*"; // for mines
        }
        document.getElementById('button' + row + col).innerHTML = symbol; //COORDINATE
    }
}
