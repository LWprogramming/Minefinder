//TODO FOR NEXT TIME:
// 1. [DONE] implement logic for clicking a cell with a 0--i.e. reveal all its neighbors recursively so that for any of its neighbors that are zero, reveal all of their neighbors as well.
// 2. [DONE] Implement right-click logic. Legal transitions are: unclicked to rightclicked, rightclicked to unclicked, uncliked to clicked. 
// 3. [DONE] Need to figure out logic for each cell.
// 4. [DONE] add reset button that can be clicked at any time. 
// add difficulty settings (easy medium hard custom) as presets
// WIP-- need to make sure in custom mode, there aren't too many mines for any given board size, and also that there aren't too many cells in general.




/*
Other assorted things (no set timeline)
- things marked PROD, aka things to be done when no longer in debug mode.
- allow user to input their choice of dimensions and number of mines. put in some sort of limit on this, though--can't support 9 million cells, for instance. also put in a check so that the number of mines doesn't exceed the number of cells.
- refactor button.id (anything labeled COORDINATE). See comments there to see--basically try to avoid manipulating strings for everything.
- refactor generateGameBoard to take parameters instead of relying on global variables numRows, numCols, and numMines.
- this entire program is run regarless of whether javascript is allowed when viewing this in chrome or not. not sure why; commenting it out prevents it from being run, so probably an issue with chrome settings or whatever, not js.
- add a game timer
- add a countdown for the number of mines
- add game statistics (that can be reset of course) and leaderboard
- support chording--look up minesweeper wiki for this.
- make the website independent of browser, version, mobile vs desktop, etc.
- see link: http://www.chezpoor.com/minesweeper/help/minetechnicalnotes.html

- overall plan-- implement logic => design/UI/UX => github pages => user testing.
*/


// If Javascript is not disabled, then remove the message saying that it is.
var jsDisabledMessage = document.getElementById("Javascript disabled message");
jsDisabledMessage.parentNode.removeChild(jsDisabledMessage);

var DEBUG = true;

var difficulty = {
    EASY: 1,
    MEDIUM: 2, 
    HARD: 3,
    CUSTOM: 0
};

var currentDifficulty = difficulty.EASY; // default to easy

// cell status must be one of these.
var cellStatusEnum = {
    UNCLICKED: 0,
    CLICKED: 1,
    RIGHTCLICKED: -1
};

var IS_MINE = -1;

if (DEBUG) {
    var UNCLICKED_COLOR = 'white';
    var RIGHT_CLICKED_COLOR = 'green';
    var LEFT_CLICKED_COLOR = 'cyan';
    var CLICKED_MINE_COLOR = 'red';
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
        gameBoard[row][col].mineStatus = IS_MINE;
        mineLocations.push(new cell(row, col));
    }

    // assign numbers to non-numerical cells
    for (var row = 0; row < numRows; row++) {
        for (var col = 0; col < numCols; col++) {
            if (gameBoard[row][col].mineStatus != IS_MINE) {
                // If the given cell doesn't have a mine, then we need the number of mines around it.
                gameBoard[row][col].mineStatus = numAdjacent(row, col, mineLocations);
            }
        }
    }
    return gameBoard;
}

function setButtons(gameBoard) {
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
            button.disabled = false; // for restarting games.
            if (DEBUG) {
                button.style.background = UNCLICKED_COLOR;
            }
            // button.row = row;
            // button.colum = col; // COORDINATE

            // left-click logic
            button.onclick = function(event) {
                var thisRow = parseInt(this.id[6]); // COORDINATE
                var thisCol = parseInt(this.id[7]); // COORDINATE
                if (gameBoard[thisRow][thisCol].status != cellStatusEnum.UNCLICKED) {
                    return; // can't click unless the cell is in its UNCLICKED state.
                }
                gameBoard[thisRow][thisCol].status = cellStatusEnum.CLICKED;
                if (DEBUG) {
                    this.style.background = LEFT_CLICKED_COLOR;
                }
                if (gameBoard[thisRow][thisCol].mineStatus == 0) {
                    // Clicked a cell with no mines next to it-- a zero. Then for each adjacent unclicked cell, click it.
                    var adjacentCellsList = []; // list of cells adjacent to current cell.
                    if (thisRow != 0) {
                        if (thisCol != 0) {
                            // upper left exists
                            adjacentCellsList.push([thisRow - 1, thisCol - 1]);
                        }
                        if (thisCol != numCols - 1) {
                            // upper right exists
                            adjacentCellsList.push([thisRow - 1, thisCol + 1]);
                        }
                        // cell directly above exists
                        adjacentCellsList.push([thisRow - 1, thisCol]);
                    }
                    if (thisRow != numRows - 1) {
                        if (thisCol != 0) {
                            // lower left exists
                            adjacentCellsList.push([thisRow + 1, thisCol - 1]);
                        }
                        if (thisCol != numCols - 1) {
                            // lower right exists
                            adjacentCellsList.push([thisRow + 1, thisCol + 1]);
                        }
                        // cell directly below exists
                        adjacentCellsList.push([thisRow + 1, thisCol]);
                    }
                    if (thisCol != 0) {
                        // cell to left exists
                        adjacentCellsList.push([thisRow, thisCol - 1]);
                    }
                    if (thisCol != numCols - 1) {
                        // cell to right exists
                        adjacentCellsList.push([thisRow, thisCol + 1]);
                    }
                    for (var i = 0; i < adjacentCellsList.length; i++) {
                        adjCell = adjacentCellsList[i];
                        var adjRow = adjCell[0];
                        var adjCol = adjCell[1];
                        if (gameBoard[adjRow][adjCol].status == cellStatusEnum.UNCLICKED) {
                            document.getElementById('button' + adjRow + adjCol).onclick(); // COORDINATE
                        }
                    }
                }
                if (gameBoard[thisRow][thisCol].mineStatus == IS_MINE) {
                    // clicked a mine

                    /*
                    Game over logic:
                    Set the clicked mine to be in red.
                    
                    Then for every other cell c:
                    set button to disabled. No more clicks should register.
                    if c has a number but is flagged, insert the icon that indicates incorrect flagging.
                    if c has a mine and is not flagged, reveal it (i.e. add the icon that indicates mine, but do not click it and do not set background to red).
                    if c has a number and is not flagged, skip over it. only leave the cells that were already clicked.
                    */

                    for (var row = 0; row < numRows; row++) {
                        for (var col = 0; col < numCols; col++) {
                            var currentButton = document.getElementById('button' + row + col); // COORDINATE
                            currentButton.disabled = true; // disable clicking after the game
                            if (gameBoard[row][col].mineStatus != IS_MINE && gameBoard[row][col].status == cellStatusEnum.RIGHTCLICKED) {
                                // flagged but not a mine
                                if (DEBUG) {
                                    document.getElementById('button' + row + col).innerHTML = "+";
                                }
                                // PROD : INSERT ICON THAT INDICATES INCORRECT FLAGGING
                            }
                            if (gameBoard[row][col].mineStatus == IS_MINE && gameBoard[row][col].status != cellStatusEnum.RIGHTCLICKED) {
                                // unflagged mine
                                // PROD : INSERT ICON THAT INDICATES INCORRECT FLAGGING
                            }
                        }
                    }

                    if (DEBUG) {
                        console.log("Game over!");
                    }

                    document.getElementById('button' + thisRow + thisCol).style.background = CLICKED_MINE_COLOR; // COORDINATE
                    // Change the content to the picture of a mine. PROD
                }
            }

            // right-click logic
            button.onmouseup = function(event) {
                if (event.which == 3) {
                    var thisRow = parseInt(this.id[6]); // COORDINATE
                    var thisCol = parseInt(this.id[7]); // COORDINATE
                    if (gameBoard[thisRow][thisCol].status == cellStatusEnum.UNCLICKED) {
                        gameBoard[thisRow][thisCol].status = cellStatusEnum.RIGHTCLICKED;
                        if (DEBUG) {
                            this.style.background = RIGHT_CLICKED_COLOR;
                        }
                    }
                    else if (gameBoard[thisRow][thisCol].status == cellStatusEnum.RIGHTCLICKED) {
                        gameBoard[thisRow][thisCol].status = cellStatusEnum.UNCLICKED;
                        if (DEBUG) {
                            this.style.background = UNCLICKED_COLOR;
                        }
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
            if (gameBoard[row][col].mineStatus != IS_MINE) {
                symbol = '' + gameBoard[row][col].mineStatus;
            }
            else {
                symbol = "*"; // for mines
            }
            document.getElementById('button' + row + col).innerHTML = symbol; //COORDINATE
        }
    }
}

function startGame(currentDifficulty, customRows=-1, customCols=-1, customMines=-1) {
    // clean out the old stuff, removing all buttons
    // probably can be optimized to just overwrite the previous states but this works fine since boards are small.
    var grid = document.getElementById('grid');
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }

    // board parameters
    switch (currentDifficulty) {
        case difficulty.EASY:
            var numRows = 8;
            var numCols = 8;
            var numMines = 10;
            break;
        case difficulty.MEDIUM:
            var numRows = 16;
            var numCols = 16;
            var numMines = 40;
        case difficulty.HARD:
            var numRows = 24;
            var numCols = 24;
            var numMines = 99;
        case difficulty.CUSTOM:
            // in this case, the number of rows, columns, and mines are custom-set.
            var numRows = customRows;
            var numCols = customCols;
            var numMines = customMines;
        default:
            break;
    }
    // build everything back up.
    var gameBoard = generateGameBoard();
    setButtons(gameBoard);
}

startGame();