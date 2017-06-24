// If Javascript is not disabled, then remove the message saying that it is.
var jsDisabledMessage = document.getElementById("Javascript disabled message");
jsDisabledMessage.parentNode.removeChild(jsDisabledMessage);
// TODO: this entire program is run regarless of whether javascript is allowed when viewing this in chrome or not. not sure why; commenting it out prevents it from being run, so probably an issue with chrome settings or whatever, not js.

// game parameters
var numRows = 6;
var numCols = 6;
var numMines = 5; // todo: put in a check so that the number of mines doesn't exceed the number of cells.

function cell(row, col) {
    // represents one cell on the board.
    this.row = row;
    this.col = col;
    this.isEqual = function(otherCell) {return (this.row == otherCell.row) && (this.col == otherCell.col);} // rather hacky and will need to change if the definition of cell changes, but unfortunately Javascript doesn't seem to have a compare objects by value equality operator. 
}

// Put together game board.
for (var row = 0; row < numRows; row++) {
    var divRow = document.createElement('div');
    divRow.className = 'row';
    for (var col = 0; col < numCols; col++) {
        var button = document.createElement('button');
        button.id = 'button' + row + col;
        // TODO: refactor this from trying to manipulate strings and into some more coherent pattern, such as an object with a row and column or something. See all locations tagged with the word COORDINATE.
        button.typeName = 'button';
        button.innerHTML = '.';
        button.className = 'button col-xs-' + 12 / numCols;
        button.onclick = function() {
            console.log(this.id);
            this.style.background = 'cyan'; // for debugging purposes.
        }
        divRow.appendChild(button);   
    }
    document.getElementById('grid').appendChild(divRow);
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

    // NOTE TO FUTURE SELF-- YOU CAN'T PUT THIS IN THE PREVIOUS LOOP.
    // because for any given cell, the entire board might not be fully set up yet so assigning numbers could give bad results.
    for (var row = 0; row < numRows; row++) {
        for (var col = 0; col < numCols; col++) {
            var symbol;
            if (gameBoard[row][col] != -1) {
                symbol = '' + gameBoard[row][col];
            }
            else {
                symbol = "*"; // for mines
            }
            document.getElementById('button' + row + col).innerHTML = symbol;
        }
    }
    return gameBoard;
}

generateGameBoard();


// TODO: implement game logic, i.e. for every non-mine cell, write a function to determine number of mines around it and fill.