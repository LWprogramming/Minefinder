//TODO FOR NEXT TIME:
// debug weird issue in medium and hard mode where some cells are not reached for some reason, leading to buggy behavior. maybe has something to do with the number of mines? need to look at carefully.
// WIP-- need to make sure in custom mode, there aren't too many mines for any given board size, and also that there aren't too many cells in general.
// create way for user to enter custom difficulties
/*
https://user-images.githubusercontent.com/13173037/27969838-81f7b83a-631a-11e7-9b96-4957681113f7.png

Observe the bug with the squares labeled 2 on the lower right, but with 1 mine next to them, the square labeled 4 but has only 3 adjacent mines. May have to do with the other bug related to the gameboard on medium/ hard difficulty.
*/



/*
Other assorted things (no set timeline)
- things marked PROD, aka things to be done when no longer in debug mode.
- refactor button.id (anything labeled COORDINATE). See comments there to see--basically try to avoid manipulating strings for everything.
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
    EASY: 'easy',
    MEDIUM: 'medium', 
    HARD: 'hard',
    CUSTOM: 'custom'
};

var defaultDifficulty = difficulty.MEDIUM;

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
function generateGameBoard(numRows, numCols, numMines) {
    var gameBoard = [];
    for (var row = 0; row < numRows; row++) {
        var rowArray = [];
        for (var col = 0; col < numCols; col++) {
            rowArray.push(new cell(row, col));
        }
        gameBoard.push(rowArray);

    // generate random locations for mines.
    var mineLocations = []; // handy list of mine coordinates for convenience. Can be derived from gameBoard but this is more convenient.
    var numMinesSoFar = 0; // avoid marking the same location twice as a mine.
    while (numMinesSoFar < numMines) {    
        var row = Math.floor(Math.random() * numRows);
        var col = Math.floor(Math.random() * numCols);
        if (gameBoard[row][col].mineStatus != IS_MINE) {
            gameBoard[row][col].mineStatus = IS_MINE;
            mineLocations.push(new cell(row, col));
            numMinesSoFar++;
        }
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

//COORDINATE
// accounts for the fact that the row and column number for buttons, when that number gets to be two digits, bugs crop up.
// returns a string that is the button id given numerical coordinates.
function buttonIDFromCoordinates(row, col) {
    var rowString = '';
    var colString = '';
    if (row < 10) {
        rowString += '0' + row;
    }
    else {
        rowString += row;
    }
    if (col < 10) {
        colString += '0' + col;
    }
    else {
        colString = col;
    }
    return 'button' + rowString + colString;
}

//COORDINATE
// returns two key-value pairs with row and column information given button id string.
function coordinatesFromButtonID(buttonID) {
    var rowString = buttonID[6] + buttonID[7];
    var colString = buttonID[8] + buttonID[9];
    return {
        row: parseInt(rowString),
        col: parseInt(colString)
    };
}

function setButtons(gameBoard) {
    // Put together game board.
    var numRows = gameBoard.length;
    var numCols = gameBoard[0].length;

    for (var row = 0; row < numRows; row++) {
        var divRow = document.createElement('div');
        divRow.className = 'row';
        for (var col = 0; col < numCols; col++) {
            var button = document.createElement('button');
            button.id = buttonIDFromCoordinates(row, col);
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
                var coordinates = coordinatesFromButtonID(this.id);
                var thisRow = coordinates.row; // COORDINATE
                var thisCol = coordinates.col; // COORDINATE
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
                            document.getElementById(buttonIDFromCoordinates(adjRow, adjCol)).onclick(); // COORDINATE
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
                            var currentButton = document.getElementById(buttonIDFromCoordinates(row, col)); // COORDINATE
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

                    document.getElementById(buttonIDFromCoordinates(thisRow, thisCol)).style.background = CLICKED_MINE_COLOR; // COORDINATE
                    // Change the content to the picture of a mine. PROD
                }
            }

            // right-click logic
            button.onmouseup = function(event) {
                if (event.which == 3) {
                    var coordinates = coordinatesFromButtonID(this.id);
                    var thisRow = coordinates.row; // COORDINATE
                    var thisCol = coordinates.col; // COORDINATE
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
    var numberOfSafeCells = 0;
    var numberOfMines = 0;
    for (var row = 0; row < numRows; row++) {
        for (var col = 0; col < numCols; col++) {
            var symbol;
            if (gameBoard[row][col].mineStatus != IS_MINE) {
                symbol = '' + gameBoard[row][col].mineStatus;
                numberOfSafeCells++;
            }
            else {
                symbol = "*"; // for mines
                numberOfMines++;
            }
            document.getElementById(buttonIDFromCoordinates(row, col)).innerHTML = symbol; //COORDINATE
        }
    }
}

function startGame(newDifficulty, customRows=-1, customCols=-1, customMines=-1) {
    // clean out the old stuff, removing all buttons
    // probably can be optimized to just overwrite the previous states but this works fine since boards are small.
    var grid = document.getElementById('grid');
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }

    // board parameters
    if (newDifficulty != difficulty.CUSTOM) {
        currentDifficulty = newDifficulty;
    }
    switch (newDifficulty) {
        case difficulty.EASY:
            var numRows = 8;
            var numCols = 8;
            var numMines = 10;
            break;
        case difficulty.MEDIUM:
            var numRows = 16;
            var numCols = 16;
            var numMines = 40;
            break;
        case difficulty.HARD:
            var numRows = 24;
            var numCols = 24;
            var numMines = 99;
            break;
        case difficulty.CUSTOM:
            // in this case, the number of rows, columns, and mines are custom-set.
            var numRows = customRows;
            var numCols = customCols;
            var numMines = customMines;
            break;
        default:
            // TODO: insert some error handling here--shouldn't ever happen but just in case 
            break;
    }
    // build everything back up.
    var gameBoard = generateGameBoard(numRows, numCols, numMines);
    
    // test to confirm that gameboard is correctly setup
    var numberOfMines = 0;
    var numberOfSafeCells = 0;
    for (var row = 0; row < numRows; row++) {
        for (var col = 0; col < numCols; col++) {
            if (gameBoard[row][col].mineStatus == IS_MINE) {
                numberOfMines++;
            }
            else {
                numberOfSafeCells++;
            }
        }
    }    
    setButtons(gameBoard);
}

startGame(defaultDifficulty);
